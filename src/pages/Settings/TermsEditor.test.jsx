// @vitest-environment jsdom
import { afterEach, beforeEach, expect, test, vi } from 'vitest'
import { act, StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Quill } from 'react-quill-new'
import TermsEditor from './TermsEditor'

const api = vi.hoisted(() => ({ terms: vi.fn(), publishTerms: vi.fn() }))
vi.mock('../../api/client', () => ({ api }))
vi.mock('../../i18n/LanguageContext', () => ({ useLanguage: () => ({ language: 'en' }) }))

const document = { title: 'תנאי שימוש', content: '<h2>תנאי השירות</h2><p>תוכן לבדיקה</p>', version: 'initial', updatedAt: '2026-10-01T00:00:00Z' }
let root, container
beforeEach(() => {
  globalThis.IS_REACT_ACT_ENVIRONMENT = true
  api.terms.mockReset()
  api.publishTerms.mockReset()
  container = globalThis.document.createElement('div')
  globalThis.document.body.append(container)
  root = createRoot(container)
})
afterEach(async () => {
  await act(async () => root.unmount())
  container.remove()
})
const render = () => act(async () => root.render(<StrictMode><TermsEditor /></StrictMode>))
const editor = () => container.querySelector('.terms-quill .ql-editor')

test('real Quill retains Hebrew text on rerender and protects the editable DOM from translation', async () => {
  api.terms.mockResolvedValue({ data: document })
  await render()
  expect(editor().textContent).toContain('תוכן לבדיקה')
  expect(editor().closest('[translate="no"]')).not.toBeNull()
  expect(editor().closest('.notranslate')).not.toBeNull()
  const preview = [...container.querySelectorAll('button')].find(button => button.textContent === 'Preview')
  await act(async () => preview.click())
  expect(editor().textContent).toContain('תוכן לבדיקה')
  await act(async () => root.render(<StrictMode><TermsEditor /></StrictMode>))
  expect(editor().textContent).toContain('תוכן לבדיקה')
  expect(container.querySelectorAll('.terms-quill .ql-toolbar')).toHaveLength(1)
})

test('a late StrictMode load cannot overwrite edits from the current document', async () => {
  let first, second
  api.terms.mockImplementationOnce(() => new Promise(resolve => { first = resolve }))
    .mockImplementationOnce(() => new Promise(resolve => { second = resolve }))
  await render()
  await act(async () => second({ data: document }))
  await act(async () => Quill.find(container.querySelector('.ql-container')).insertText(0, 'Edited ', 'user'))
  await act(async () => first({ data: { ...document, content: '<p>Outdated response</p>' } }))
  expect(editor().textContent).toContain('Edited ')
  expect(editor().textContent).toContain('תוכן לבדיקה')
  expect(editor().textContent).not.toContain('Outdated response')
})

test('save and reopen preserve the published Hebrew document', async () => {
  api.terms.mockResolvedValue({ data: document })
  api.publishTerms.mockImplementation(async body => ({ data: { ...body, version: 'published', updatedAt: document.updatedAt } }))
  await render()
  await act(async () => Quill.find(container.querySelector('.ql-container')).insertText(0, 'Edited ', 'user'))
  await act(async () => container.querySelector('form').dispatchEvent(new Event('submit', { bubbles: true, cancelable: true })))
  const published = api.publishTerms.mock.calls[0][0]
  expect(published.content).toContain('Edited ')
  expect(published.content).toContain('תוכן לבדיקה')
  expect(editor().textContent).toContain('תוכן לבדיקה')
  await act(async () => root.render(null))
  api.terms.mockResolvedValue({ data: { ...published, version: 'published', updatedAt: document.updatedAt } })
  await render()
  expect(editor().textContent).toContain('Edited ')
  expect(editor().textContent).toContain('תוכן לבדיקה')
})
