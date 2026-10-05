import { useCallback, useEffect, useRef, useState } from 'react'
import ReactQuill from 'react-quill-new'
import DOMPurify from 'dompurify'
import 'react-quill-new/dist/quill.snow.css'
import { api } from '../../api/client'
import { useLanguage } from '../../i18n/LanguageContext'

const modules = { toolbar: [
  [{ header: [1, 2, 3, false] }], ['bold', 'italic', 'underline', 'strike'],
  [{ list: 'ordered' }, { list: 'bullet' }], [{ direction: 'rtl' }, { align: [] }], ['link', 'clean'],
] }

export default function TermsEditor() {
  const { language } = useLanguage()
  const he = language === 'he'
  const [terms, setTerms] = useState(null)
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [preview, setPreview] = useState(false)
  const [saved, setSaved] = useState(false)
  const loadRequest = useRef(0)

  const load = useCallback(async () => {
    const requestId = ++loadRequest.current
    setError('')
    try {
      const response = await api.terms()
      if (requestId !== loadRequest.current) return
      setTerms(response.data)
      setTitle(response.data.title)
      setContent(response.data.content)
    } catch (err) {
      if (requestId === loadRequest.current) setError(err.message)
    }
  }, [])
  useEffect(() => {
    load()
    return () => { loadRequest.current += 1 }
  }, [load])

  const publish = async (event) => {
    event.preventDefault()
    setSaving(true)
    setError('')
    setSaved(false)
    try {
      const response = await api.publishTerms({ title, content })
      setTerms(response.data)
      setContent(response.data.content)
      setSaved(true)
    } catch (err) { setError(err.message) }
    finally { setSaving(false) }
  }

  return <section className="panel settings-card terms-editor-card">
    <h2>{he ? 'תנאי שימוש' : 'Terms of Use'}</h2>
    <p>{he ? 'התוכן מתפרסם באתר ובשתי האפליקציות.' : 'Published content appears on the website and in both apps.'}</p>
    {error && <div className="login-error" role="alert">{error}</div>}
    {!terms ? <button type="button" onClick={load}>{he ? 'טען מחדש' : 'Reload'}</button> :
      <form onSubmit={publish}>
        <p>{he ? 'עודכן לאחרונה: ' : 'Last updated: '}{new Date(terms.updatedAt).toLocaleDateString(he ? 'he-IL' : 'en-GB')}</p>
        <label>{he ? 'כותרת' : 'Title'}<input dir="rtl" lang="he" translate="no" className="notranslate" required maxLength={200} value={title} disabled={saving} onChange={e => { setTitle(e.target.value); setSaved(false) }} /></label>
        {/* Browser translators mutate contenteditable nodes and corrupt Quill's document. */}
        <div className="terms-quill notranslate" dir="rtl" lang="he" translate="no"><ReactQuill key={terms.version} className="notranslate" theme="snow" value={content} useSemanticHTML={false} readOnly={saving} modules={modules} onChange={(value, _delta, source) => {
          if (source !== 'user') return
          setContent(value)
          setSaved(false)
        }} /></div>
        <button type="button" className="save-button" onClick={() => setPreview(!preview)}>{he ? 'תצוגה מקדימה' : 'Preview'}</button>
        {preview && <div className="ql-snow notranslate" translate="no" lang="he"><h3 dir="rtl">{title}</h3><article className="ql-editor" dir="rtl" dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(content) }} /></div>}
        <button type="submit" className="save-button" disabled={saving || !title.trim()}>{saving ? (he ? 'שומר...' : 'Saving...') : (he ? 'שמור ופרסם' : 'Save and publish')}</button>
        {saved && <p role="status">{he ? 'תנאי השימוש פורסמו בהצלחה.' : 'Terms published successfully.'}</p>}
      </form>}
  </section>
}
