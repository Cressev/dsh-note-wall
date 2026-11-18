import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { StickyWallService } from './lib/index.mjs'

const folder = { id: 'inbox', name: 'Inbox', emoji: '', color: 'blue', order: 0, builtin: true }
const note = { id: 'note', folderId: 'inbox', text: 'local', color: 'yellow', pinned: false, struck: false, createdAt: 1, updatedAt: 1, deletedAt: null, origin: null, images: [] }
const initial = { folders: [folder], notes: [note], images: [] }

function harness() {
  let fail = false
  const tables = Object.fromEntries(['folders', 'notes', 'images', 'snapshots'].map(name => [name, new Map()]))
  for (const name of ['folders', 'notes', 'images']) for (const row of initial[name]) tables[name].set(row.id, structuredClone(row))
  const domain = { table(name) { const map = tables[name]; return {
    entries: () => map.entries(), keys: () => map.keys(),
    put: async (key, value) => { if (fail) throw new Error('disk failure'); map.set(key, structuredClone(value)) },
    delete: async key => { if (fail) throw new Error('disk failure'); map.delete(key) },
  } } }
  let pending = ''
  const journal = { global: { get: () => ({ pending }), set: async value => { pending = value.pending } } }
  const service = Object.create(StickyWallService.prototype)
  Object.assign(service, { initialized: Promise.resolve(), domain: Promise.resolve(domain), journal: Promise.resolve(journal), syncLock: Promise.resolve(), syncBroken: false, limits: { recent: 2, daily: 2 } })
  return { service, domain, journal, fail: value => { fail = value } }
}

test('journal preserves the old wall on failure and recovers on restart', async () => {
  const h = harness()
  const next = { ...initial, notes: [{ ...note, text: 'cloud' }] }
  assert.equal(await h.service.syncApply({ expected: initial, next }), true)
  assert.equal((await h.service.syncRead()).notes[0].text, 'cloud')
  assert.equal(await h.service.syncApply({ expected: initial, next }), false)
  h.fail(true)
  await assert.rejects(h.service.syncApply({ expected: next, next: initial }), /disk failure/)
  assert.notEqual(h.journal.global.get().pending, '')
  await assert.rejects(h.service.syncRead(), /recovery is required/)
  h.fail(false)
  await h.service.recoverSync()
  assert.equal(h.journal.global.get().pending, '')
  assert.equal(h.service.syncValue(h.domain).notes[0].text, 'cloud')
})
