import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { mergeWalls, type SyncWall } from './src/sync-merge.ts'

const folder = { id: 'inbox', name: 'Inbox', emoji: '', color: 'blue' as const, order: 0, builtin: true }
const note = { id: 'n', folderId: 'inbox', text: 'base', color: 'yellow' as const, pinned: false, struck: false, createdAt: 1, updatedAt: 1, deletedAt: null, origin: null, images: [] }
const wall = (notes: SyncWall['notes'] = [], folders: SyncWall['folders'] = [folder], images: SyncWall['images'] = []): SyncWall => ({ folders, notes, images })
const merge = (base: SyncWall, local: SyncWall, remote: SyncWall) => mergeWalls(base, local, remote, () => 'conflict-id')

test('first sync joins distinct existing notes from both machines', () => {
  const result = merge(wall(), wall([note]), wall([{ ...note, id: 'other', text: 'other' }]))
  assert.deepEqual(result.wall.notes.map(n => n.id).sort(), ['n', 'other'])
})
test('offline deletion propagates when other side did not edit', () => {
  assert.deepEqual(merge(wall([note]), wall(), wall([note])).wall.notes, [])
})
test('concurrent edits retain both versions', () => {
  const result = merge(wall([note]), wall([{ ...note, text: 'local' }]), wall([{ ...note, text: 'remote' }]))
  assert.equal(result.conflicts, 1)
  assert.deepEqual(result.wall.notes.map(n => n.text), ['remote', '【同步冲突副本】local'])
})
test('concurrent hard delete and edit retain the edit', () => {
  const result = merge(wall([note]), wall(), wall([{ ...note, text: 'edited' }]))
  assert.equal(result.wall.notes[0]?.text, 'edited')
  assert.equal(result.conflicts, 1)
})
test('Postgres JSON key reordering does not create a false conflict', () => {
  const reordered = JSON.parse(JSON.stringify(note, Object.keys(note).reverse())) as typeof note
  const result = merge(wall([note]), wall([note]), wall([reordered]))
  assert.equal(result.conflicts, 0)
  assert.equal(result.wall.notes.length, 1)
})
test('folder conflicts stop without producing a result', () => {
  assert.throws(() => merge(wall(), wall([], [{ ...folder, name: 'A' }]), wall([], [{ ...folder, name: 'B' }])), /folder conflict/)
})
test('images are retained and invalid references stop sync', () => {
  const image = { id: 'i', dataUrl: 'data:image/png;base64,AA==', createdAt: 1 }
  assert.equal(merge(wall(), wall([], [folder], [image]), wall()).wall.images.length, 1)
  assert.throws(() => merge(wall(), wall([{ ...note, images: ['missing'] }]), wall()), /missing image/)
})
