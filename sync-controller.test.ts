import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { canonical, type SyncWall } from './src/sync-merge.ts'
import { SyncController, type SyncApi } from './src/client/sync-controller.ts'

const folder = { id: 'inbox', name: 'Inbox', emoji: '', color: 'blue' as const, order: 0, builtin: true }
const note = { id: 'n', folderId: 'inbox', text: 'original', color: 'yellow' as const, pinned: false, struck: false, createdAt: 1, updatedAt: 1, deletedAt: null, origin: null, images: [] }
const wall = (notes: SyncWall['notes'] = []): SyncWall => ({ folders: [folder], notes, images: [] })
const copy = <T>(value: T): T => structuredClone(value)

test('two devices preserve offline edits and retry a local write race', async () => {
  const values = new Map<string, string>()
  Object.defineProperty(globalThis, 'localStorage', { configurable: true, value: {
    getItem: (key: string) => values.get(key) ?? null, setItem: (key: string, value: string) => values.set(key, value), removeItem: (key: string) => values.delete(key),
  } })
  let remote: { revision: number, wall: SyncWall } | undefined
  let offline = false
  Object.defineProperty(globalThis, 'fetch', { configurable: true, value: async (url: string, init: RequestInit = {}) => {
    if (offline) throw new Error('offline')
    if (url.includes('/auth/v1/token')) return Response.json({ access_token: 'test', refresh_token: 'test', expires_at: Date.now() / 1000 + 3600, user: { id: 'user', email: 'test@example.test' } })
    if (url.includes('/rpc/')) {
      const body = JSON.parse(String(init.body)) as { expected_revision: number, new_wall: SyncWall }
      if ((remote?.revision ?? 0) !== body.expected_revision) return Response.json(false)
      remote = { revision: body.expected_revision + 1, wall: copy(body.new_wall) }
      return Response.json(true)
    }
    if (url.includes('select=revision,wall')) return Response.json(remote ? [remote] : [])
    if (url.includes('select=revision')) return Response.json(remote ? [{ revision: remote.revision }] : [])
    throw new Error('unexpected request')
  } })
  const device = (initial: SyncWall) => {
    let local = copy(initial)
    const normalized = (value: SyncWall): SyncWall => ({ ...value, notes: [...value.notes].sort((a, b) => a.id.localeCompare(b.id)) })
    let base: { wall: SyncWall, revision: number } = { wall: { folders: [], notes: [], images: [] }, revision: 0 }
    let beforeApply: (() => void) | undefined
    const api: SyncApi = {
      syncRead: async () => ({ ok: true, value: normalized(copy(local)) }),
      syncApply: async ({ expected, next }) => {
        beforeApply?.(); beforeApply = undefined
        if (canonical(normalized(local)) !== canonical(expected)) return { ok: true, value: false }
        local = copy(next); return { ok: true, value: true }
      },
    }
    const store = async (_user: string, write?: typeof base) => { if (write) base = copy(write); return copy(base) }
    const controller = new SyncController(api, () => {}, store)
    return { controller, read: () => copy(local), set: (value: SyncWall) => { local = copy(value) }, onApply: (fn: () => void) => { beforeApply = fn } }
  }
  const a = device(wall([note])), b = device(wall())
  const wait = async (controller: SyncController) => {
    for (let i = 0; i < 100 && controller.getSnapshot().state === 'syncing'; i++) await new Promise(resolve => setTimeout(resolve, 2))
    assert.notEqual(controller.getSnapshot().state, 'syncing')
  }
  await a.controller.signIn('test@example.test', 'password'); await wait(a.controller)
  await b.controller.signIn('test@example.test', 'password'); await wait(b.controller)
  assert.equal(b.read().notes[0]?.text, 'original')
  offline = true
  a.set(wall([{ ...note, text: 'first edit' }]))
  b.set(wall([{ ...note, text: 'second edit' }]))
  await a.controller.sync(); await b.controller.sync()
  assert.equal(a.controller.getSnapshot().state, 'error')
  offline = false
  await a.controller.sync(); await b.controller.sync(); await a.controller.sync()
  assert.equal(a.read().notes.length, 2)
  assert.equal(b.read().notes.length, 2)
  assert.ok(a.read().notes.some(n => n.text.includes('first edit')))
  assert.ok(a.read().notes.some(n => n.text.includes('second edit')))
  // A write that arrives during local application is rejected and merged on retry.
  a.set(wall([...a.read().notes, { ...note, id: 'new', text: 'new remote' }]))
  await a.controller.sync()
  b.onApply(() => { b.set(wall([...b.read().notes, { ...note, id: 'local-race', text: 'race' }])) })
  await b.controller.sync()
  await b.controller.sync()
  await a.controller.sync()
  assert.ok(a.read().notes.some(n => n.id === 'local-race'))
  assert.ok(b.read().notes.some(n => n.id === 'new'))
})
