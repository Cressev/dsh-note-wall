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

function normalize(wall: SyncWall): SyncWall {
  const sort = <T extends { id: string }>(rows: readonly T[]): T[] => [...rows].sort((a, b) => a.id.localeCompare(b.id))
  return { folders: sort(wall.folders), notes: sort(wall.notes), images: sort(wall.images) }
}
function equal(a: SyncWall, b: SyncWall): boolean { return canonical(normalize(a)) === canonical(normalize(b)) }

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
    void this.sync()
  }
  stop(): void { this.disposed = true; if (this.timer !== undefined) window.clearInterval(this.timer); this.timer = undefined }
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
      this.set('syncing', '同步中')
      const session = await this.token()
      const base = await this.bases(session.user.id)
      const localResult = await this.api.syncRead()
      if (!localResult.ok || localResult.value === undefined) throw new Error('读取本机便签失败')
      const local = normalize(localResult.value)
      let rows = await this.request('/rest/v1/dsh_note_wall_sync_v1?select=revision', {}, session.access_token) as { revision: number, wall?: SyncWall }[]
      if (!Array.isArray(rows) || rows.length > 1) throw new Error('云端数据格式异常')
      if (rows[0] !== undefined && rows[0].revision !== base.revision) {
        rows = await this.request('/rest/v1/dsh_note_wall_sync_v1?select=revision,wall', {}, session.access_token) as { revision: number, wall: SyncWall }[]
        if (!Array.isArray(rows) || rows.length !== 1 || rows[0]?.wall === undefined) throw new Error('云端数据格式异常')
      }
      const revision = rows[0]?.revision ?? 0
      const remote = rows[0] === undefined ? EMPTY : rows[0].wall === undefined ? base.wall : normalize(rows[0].wall)
      const merged = normalize(mergeWalls(base.wall, local, remote, () => crypto.randomUUID()).wall)
      if (this.session?.user.id !== session.user.id || this.disposed) return
      let committedRevision = revision
      if (revision === 0 || !equal(merged, remote)) {
        const ok = await this.request('/rest/v1/rpc/dsh_note_wall_compare_and_swap_v1', { method: 'POST', body: JSON.stringify({ expected_revision: revision, new_wall: merged }) }, session.access_token)
        if (ok !== true) { this.set('syncing', '云端有新变化，准备重新合并'); return }
        committedRevision = revision + 1
      }
      if (this.session?.user.id !== session.user.id || this.disposed) return
      if (!equal(local, merged)) {
        const result = await this.api.syncApply({ expected: local, next: merged })
        if (!result.ok) throw new Error('更新本机便签失败')
        if (!result.value) { this.set('syncing', '本机有新变化，准备重新合并'); return }
        this.onChange()
      }
      await this.bases(session.user.id, { wall: merged, revision: committedRevision })
      this.set('ready', '已同步')
    } catch (error) {
      const message = error instanceof Error ? error.message : '同步失败'
      this.set('error', message.startsWith('folder conflict:') ? '文件夹存在冲突，已暂停同步' : `同步失败：${message}`)
    } finally { this.busy = false }
  }
}
