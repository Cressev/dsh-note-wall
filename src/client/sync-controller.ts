import { canonical, mergeWalls, type SyncWall } from '../sync-merge.ts'

// This is the project's public, RLS-restricted key; it is not a service secret.
const URL = 'https://mnfvjcntimpcrovkjvfo.supabase.co'
const KEY = 'sb_publishable_hSPgeAD5aUV0xVn1oe_CRQ_l64oBbEV'
const SESSION_KEY = 'dsh-note-wall.supabase.session.v1'
const EMPTY: SyncWall = { folders: [], notes: [], images: [] }

interface Session { access_token: string, refresh_token: string, expires_at: number, user: { id: string, email?: string } }
interface BaseRecord { wall: SyncWall, revision: number }
interface Result<T> { ok: boolean, value?: T, error?: unknown }
export interface SyncApi {
  syncRead(): Promise<Result<SyncWall>>
  syncApply(request: { expected: SyncWall, next: SyncWall }): Promise<Result<boolean>>
}
export interface SyncStatus { state: 'signed-out' | 'syncing' | 'ready' | 'error', text: string, email: string }

/** Id order must be locale-independent: the browser collates 「收纳盒」 after
 * 「灵感」 under zh-CN while the host sorts it before under en-US, which made
 * every compare-and-swap look like a local change. Compare code units. */
function compareId(a: { readonly id: string }, b: { readonly id: string }): number {
  return a.id < b.id ? -1 : a.id > b.id ? 1 : 0
}

function normalize(wall: SyncWall): SyncWall {
  const sort = <T extends { id: string }>(rows: readonly T[]): T[] => [...rows].sort(compareId)
  return { folders: sort(wall.folders), notes: sort(wall.notes), images: sort(wall.images) }
}
function equal(a: SyncWall, b: SyncWall): boolean { return canonical(normalize(a)) === canonical(normalize(b)) }

/** Turn a gateway failure into a short, readable line instead of [object Object]. */
function describeRemoteFailure(error: unknown): string {
  if (error === undefined || error === null) return ''
  const text = typeof error === 'string' ? error : JSON.stringify(error)
  return String(text).slice(0, 200)
}

/** IndexedDB is used instead of localStorage because note images can be large. */
async function baseStore(user: string, write?: BaseRecord): Promise<BaseRecord> {
  const db = await new Promise<IDBDatabase>((resolve, reject) => {
    const req = indexedDB.open('dsh-note-wall-sync-v1', 1)
    req.onupgradeneeded = () => { req.result.createObjectStore('bases') }
    req.onsuccess = () => { resolve(req.result) }
    req.onerror = () => { reject(req.error) }
  })
  try {
    return await new Promise<BaseRecord>((resolve, reject) => {
      const tx = db.transaction('bases', write === undefined ? 'readonly' : 'readwrite')
      const store = tx.objectStore('bases')
      const req = write === undefined ? store.get(user) : store.put(write, user)
      let result: BaseRecord = write ?? { wall: EMPTY, revision: 0 }
      req.onsuccess = () => { if (write === undefined) result = (req.result as BaseRecord | undefined) ?? result }
      tx.oncomplete = () => { resolve(result) }
      tx.onerror = () => { reject(tx.error) }
      tx.onabort = () => { reject(tx.error) }
    })
  } finally { db.close() }
}

export class SyncController {
  private session: Session | null = null
  private status: SyncStatus = { state: 'signed-out', text: '未登录云同步', email: '' }
  private readonly listeners = new Set<() => void>()
  private timer: number | undefined
  private busy = false
  private disposed = false
  /** Resolves the Web Lock held by this page, releasing it to the next tab. */
  private releaseLock: (() => void) | undefined
  constructor(private readonly api: SyncApi, private readonly onChange: () => void, private readonly bases = baseStore) {
    try { this.session = JSON.parse(localStorage.getItem(SESSION_KEY) ?? 'null') as Session | null } catch { this.session = null }
    if (this.session !== null) this.set('syncing', '准备同步')
  }
  getSnapshot = (): SyncStatus => this.status
  subscribe = (listener: () => void): (() => void) => { this.listeners.add(listener); return () => { this.listeners.delete(listener) } }
  start(): void {
    if (this.timer !== undefined) return
    this.disposed = false
    this.timer = window.setInterval(() => { void this.sync() }, 5000)
    void this.acquireLock()
  }
  stop(): void {
    this.disposed = true
    if (this.timer !== undefined) window.clearInterval(this.timer)
    this.timer = undefined
    this.releaseLock?.()
    this.releaseLock = undefined
  }
  /**
   * Only one page may sync this browser profile at a time. Two tabs each read
   * the local wall, merge and write it back; whichever writes second finds the
   * wall already changed, so both pages flip between "syncing" and "local
   * changed" forever without ever converging. A Web Lock elects one leader and
   * hands the role to the next tab when this one closes.
   */
  private async acquireLock(): Promise<void> {
    const locks = (navigator as Navigator & { locks?: LockManager }).locks
    if (locks === undefined) { void this.sync(); return }
    try {
      await locks.request('dsh-note-wall.sync.v1', async () => {
        if (this.disposed) return
        void this.sync()
        await new Promise<void>(resolve => { this.releaseLock = resolve })
      })
    } catch {
      // Locking is unavailable or was interrupted; sync without it rather than
      // leaving the wall permanently unsynced.
      void this.sync()
    }
  }
  private set(state: SyncStatus['state'], text: string): void {
    this.status = { state, text, email: this.session?.user.email ?? '' }
    for (const listener of this.listeners) listener()
  }
  private saveSession(session: Session): void {
    if (!session.access_token || !session.refresh_token || !session.user?.id) throw new Error('登录信息不完整')
    this.session = session
    localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  }
  private async request(path: string, init: RequestInit = {}, token?: string): Promise<any> {
    const response = await fetch(`${URL}${path}`, { ...init, headers: { apikey: KEY, 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}), ...init.headers } })
    const body = await response.json().catch(() => null) as any
    if (!response.ok) throw new Error(String(body?.msg ?? body?.error_description ?? body?.message ?? `请求失败 (${response.status})`))
    return body
  }
  async signIn(email: string, password: string): Promise<void> {
    const session = await this.request('/auth/v1/token?grant_type=password', { method: 'POST', body: JSON.stringify({ email, password }) }) as Session
    this.saveSession(session)
    this.set('syncing', '登录成功，正在同步')
    void this.sync()
  }
  async signUp(email: string, password: string): Promise<boolean> {
    const result = await this.request('/auth/v1/signup', { method: 'POST', body: JSON.stringify({ email, password }) }) as Session
    if (result.access_token) { this.saveSession(result); void this.sync(); return true }
    return false
  }
  signOut(): void {
    this.session = null
    localStorage.removeItem(SESSION_KEY)
    this.set('signed-out', '未登录云同步')
  }
  private async token(): Promise<Session> {
    const current = this.session
    if (current === null) throw new Error('请登录云同步')
    if (current.expires_at > Date.now() / 1000 + 60) return current
    const refreshed = await this.request('/auth/v1/token?grant_type=refresh_token', { method: 'POST', body: JSON.stringify({ refresh_token: current.refresh_token }) }) as Session
    // A sign-out or account change while refreshing must not restore the session.
    if (this.session !== current) throw new Error('登录状态已改变')
    this.saveSession(refreshed)
    return refreshed
  }
  async sync(): Promise<void> {
    if (this.busy || this.session === null || this.disposed) return
    this.busy = true
    try {
      // A local write landing between syncRead and syncApply makes the
      // compare-and-swap reject. That is normal and self-healing: re-read and
      // merge again right away instead of waiting for the next 5s tick.
      for (let attempt = 0; attempt < 3; attempt++) {
        const outcome = await this.syncOnce()
        if (outcome !== 'retry-local') return
        if (attempt < 2) await new Promise<void>(resolve => { window.setTimeout(resolve, 200) })
      }
      this.set('error', '同步受阻：本机便签一直在变化，稍后自动重试')
    } catch (error) {
      const message = error instanceof Error ? error.message : '同步失败'
      this.set('error', message.startsWith('folder conflict:') ? '文件夹存在冲突，已暂停同步' : `同步失败：${message}`)
    } finally { this.busy = false }
  }

  /** Run one sync round. Returns 'retry-local' when the local wall changed mid-round. */
  private async syncOnce(): Promise<'done' | 'retry-local'> {
    this.set('syncing', '同步中')
    const session = await this.token()
    const base = await this.bases(session.user.id)
    const localResult = await this.api.syncRead()
    if (!localResult.ok || localResult.value === undefined) {
      const detail = describeRemoteFailure(localResult.error)
      throw new Error(`读取本机便签失败${detail === '' ? '（宿主未加载同步接口，请重启 dsh web 后再试）' : `：${detail}`}`)
    }
    const local = normalize(localResult.value)
    let rows = await this.request('/rest/v1/dsh_note_wall_sync_v1?select=revision', {}, session.access_token) as { revision: number, wall?: SyncWall }[]
    if (!Array.isArray(rows) || rows.length > 1) throw new Error('云端数据格式异常')
    if (rows[0] !== undefined && rows[0].revision !== base.revision) {
      rows = await this.request('/rest/v1/dsh_note_wall_sync_v1?select=revision,wall', {}, session.access_token) as { revision: number, wall: SyncWall }[]
      if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.wall === undefined) throw new Error('云端数据格式异常')
    }
    const revision = rows[0]?.revision ?? 0
    const remote = rows[0] === undefined ? EMPTY : rows[0].wall === undefined ? base.wall : normalize(rows[0].wall)
    const mergeResult = mergeWalls(base.wall, local, remote, () => crypto.randomUUID())
    const merged = normalize(mergeResult.wall)
    if (this.session?.user.id !== session.user.id || this.disposed) return 'done'
    let committedRevision = revision
    if (revision === 0 || !equal(merged, remote)) {
      const ok = await this.request('/rest/v1/rpc/dsh_note_wall_compare_and_swap_v1', { method: 'POST', body: JSON.stringify({ expected_revision: revision, new_wall: merged }) }, session.access_token)
      if (ok !== true) { this.set('syncing', '云端有新变化，准备重新合并'); return 'done' }
      committedRevision = revision + 1
    }
    if (this.session?.user.id !== session.user.id || this.disposed) return 'done'
    if (!equal(local, merged)) {
      const result = await this.api.syncApply({ expected: local, next: merged })
      if (!result.ok) throw new Error(`更新本机便签失败：${describeRemoteFailure(result.error)}`)
      if (!result.value) {
        // The local wall changed between the read above and this write. Show
        // exactly what drifted, then let the caller retry immediately.
        const after = await this.api.syncRead()
        const diff = after.ok && after.value !== undefined ? firstDifference(after.value, local) : ''
        this.set('syncing', diff === '' ? '本机有新变化，正在重新合并' : `本机有新变化（${diff}），正在重新合并`)
        return 'retry-local'
      }
      this.onChange()
    }
    await this.bases(session.user.id, { wall: merged, revision: committedRevision })
    this.set('ready', mergeResult.conflicts === 0 ? '已同步' : `已同步（${mergeResult.conflicts} 处差异以云端为准）`)
    return 'done'
  }
}

/** Describe the first structural difference between two walls, for diagnostics. */
function firstDifference(a: SyncWall, b: SyncWall): string {
  const tables: readonly (readonly [string, readonly { readonly id: string }[], readonly { readonly id: string }[]])[] = [
    ['folders', a.folders, b.folders],
    ['notes', a.notes, b.notes],
    ['images', a.images, b.images],
  ]
  for (const [name, leftRows, rightRows] of tables) {
    const left = new Map<string, Record<string, unknown>>()
    const right = new Map<string, Record<string, unknown>>()
    for (const row of leftRows) left.set(row.id, row as unknown as Record<string, unknown>)
    for (const row of rightRows) right.set(row.id, row as unknown as Record<string, unknown>)
    for (const id of new Set([...left.keys(), ...right.keys()])) {
      const x = left.get(id)
      const y = right.get(id)
      if (x === undefined || y === undefined) return `${name}/${id.slice(0, 8)} ${x === undefined ? '仅云端有' : '仅本机有'}`
      if (canonical(x) !== canonical(y)) {
        const fields = [...new Set([...Object.keys(x), ...Object.keys(y)])].filter(field => canonical(x[field]) !== canonical(y[field]))
        return `${name}/${id.slice(0, 8)} 字段 ${fields.join('/')}`
      }
    }
  }
  return ''
}
