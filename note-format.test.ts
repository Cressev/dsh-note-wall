import { strict as assert } from 'node:assert'
import { test } from 'node:test'
import { applyNoteFormat } from './src/client/note-markdown.tsx'

/** A textarea whose native value setter collapses the selection, as browsers do. */
class FakeTextarea {
  private text = ''
  selectionStart = 0
  selectionEnd = 0
  get value() { return this.text }
  set value(value: string) { this.text = value; this.selectionStart = this.selectionEnd = value.length }
  setSelectionRange(start: number, end: number) { this.selectionStart = start; this.selectionEnd = end }
  dispatchEvent() { return true }
}
Object.defineProperty(globalThis, 'HTMLTextAreaElement', { value: FakeTextarea, configurable: true })
// Rapid clicks happen before the browser runs any queued animation frame.
Object.defineProperty(globalThis, 'requestAnimationFrame', { value: () => 1, configurable: true })

function textarea(text: string, start: number, end = start): FakeTextarea {
  const area = new FakeTextarea()
  area.value = text
  area.setSelectionRange(start, end)
  return area
}
function apply(area: FakeTextarea, format: Parameters<typeof applyNoteFormat>[1]): void {
  applyNoteFormat(area as unknown as HTMLTextAreaElement, format)
}

test('repeated list clicks toggle only the current middle line', () => {
  const area = textarea('first\nsecond\nthird', 8)
  apply(area, 'ol')
  assert.equal(area.value, 'first\n1. second\nthird')
  assert.equal(area.selectionStart, area.selectionEnd)
  apply(area, 'ol')
  assert.equal(area.value, 'first\nsecond\nthird')
  assert.equal(area.selectionStart, 8)
  assert.equal(area.selectionEnd, 8)
})

test('consecutive different block formats stay on the same line', () => {
  const area = textarea('first\nsecond\nthird', 8)
  apply(area, 'task')
  apply(area, 'ol')
  apply(area, 'ul')
  assert.equal(area.value, 'first\n- second\nthird')
  assert.equal(area.selectionStart, area.selectionEnd)
})

test('a selection ending at the next line start does not format that line', () => {
  const area = textarea('first\nsecond\nthird', 0, 6)
  apply(area, 'task')
  assert.equal(area.value, '- [ ] first\nsecond\nthird')
  apply(area, 'task')
  assert.equal(area.value, 'first\nsecond\nthird')
})

test('a deliberate multi-line selection toggles exactly those lines', () => {
  const area = textarea('first\nsecond\nthird\nfourth', 2, 14)
  apply(area, 'ul')
  assert.equal(area.value, '- first\n- second\n- third\nfourth')
  apply(area, 'ul')
  assert.equal(area.value, 'first\nsecond\nthird\nfourth')
})

test('formatting at the start of a leading empty line stays on that line', () => {
  const area = textarea('\nsecond', 0)
  apply(area, 'ol')
  assert.equal(area.value, '1. \nsecond')
  assert.equal(area.selectionStart, area.selectionEnd)
})
