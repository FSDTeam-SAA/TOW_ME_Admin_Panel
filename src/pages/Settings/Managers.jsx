import React, { useCallback, useState } from 'react'
import { Save, UserPlus, X } from 'lucide-react'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'

const PERMISSIONS = ['dashboard', 'drivers', 'trips', 'customers', 'finance', 'support', 'settings']
const blank = { name: '', email: '', phoneNumber: '', adminPermissions: [] }

export default function Managers() {
  const { t } = useLanguage()
  const fetcher = useCallback(() => api.managers(), [])
  const { data, error, loading, reload } = useApiResource(fetcher, { queryKey: ['managers'] })
  const [editing, setEditing] = useState(null)
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')
  const managers = Array.isArray(data) ? data : []

  const save = async (event) => {
    event.preventDefault()
    if (!editing) return
    setBusy(true)
    setActionError('')
    try {
      const { name, email, phoneNumber, adminPermissions } = editing
      const payload = { name, email, phoneNumber, adminPermissions }
      if (editing._id) await api.updateManager(editing._id, payload)
      else await api.createManager(payload)
      await reload()
      setEditing(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleBlock = async (manager) => {
    setBusy(true)
    setActionError('')
    try {
      await api.updateManager(manager._id, { isBlocked: !manager.isBlocked })
      await reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  return <section className="panel settings-card managers-card">
    <div className="settings-card-head">
      <div><h2>{t.managersTitle || 'Administrators'}</h2><p>{t.managersHelp || 'Only the Master Administrator can manage access.'}</p></div>
      <button type="button" className="save-button manager-add-button" onClick={() => { setActionError(''); setEditing({ ...blank }) }}><UserPlus size={17} />{t.addManager || 'Add administrator'}</button>
    </div>
    {error && <PageState error={error} onRetry={reload} t={t} />}
    {loading && <PageState loading t={t} />}
    {actionError && !editing && <div className="login-error" role="alert">{actionError}</div>}
    {!loading && !error && <div className="manager-list">{managers.map((manager) => <div key={manager._id} className="manager-row">
      <div><b>{manager.name}</b><small>{manager.email} · {manager.isBlocked ? (t.blocked || 'Blocked') : (t.cmActive || 'Active')}</small>
        <small>{(manager.adminPermissions || []).map((item) => t.permissionNames?.[item] || item).join(', ') || '—'}</small>
        {manager.pinSetupPending && <small>{t.managerPinSetupPending}</small>}</div>
      <div className="manager-actions">
        <button type="button" onClick={() => setEditing({ ...manager })}>{t.edit || 'Edit'}</button>
        <button type="button" disabled={busy} onClick={() => toggleBlock(manager)}>{manager.isBlocked ? (t.unlock || 'Unblock') : (t.cmBlock || 'Block')}</button>
      </div>
    </div>)}</div>}
    {editing && <div className="driver-modal-backdrop" onMouseDown={() => setEditing(null)}>
      <form className="driver-modal manager-form" role="dialog" aria-modal="true" aria-labelledby="manager-dialog-title" onMouseDown={(event) => event.stopPropagation()} onSubmit={save}>
        <div className="driver-modal-head"><h2 id="manager-dialog-title">{editing._id ? (t.editManager || 'Edit administrator') : (t.addManager || 'Add administrator')}</h2>
          <button type="button" onClick={() => setEditing(null)} aria-label={t.close}><X size={18} /></button></div>
        <div className="modal-body">
        {actionError && <div className="login-error" role="alert">{actionError}</div>}
        <div className="driver-form-grid">
          <label><span>{t.fullName}</span><input required value={editing.name} onChange={(e) => setEditing({ ...editing, name: e.target.value })} /></label>
          <label><span>{t.email}</span><input required type="email" dir="ltr" value={editing.email} onChange={(e) => setEditing({ ...editing, email: e.target.value })} /></label>
          <label><span>{t.phone}</span><input required type="tel" dir="ltr" value={editing.phoneNumber} onChange={(e) => setEditing({ ...editing, phoneNumber: e.target.value })} /></label>
        </div>
        {!editing._id && <p className="manager-setup-help">{t.managerPinSetupHelp}</p>}
        <fieldset className="manager-permissions"><legend>{t.permissions || 'Permissions'}</legend>
          {PERMISSIONS.map((permission) => <label key={permission}><input type="checkbox" checked={editing.adminPermissions?.includes(permission) || false}
            onChange={(e) => setEditing({ ...editing, adminPermissions: e.target.checked
              ? [...(editing.adminPermissions || []), permission]
              : editing.adminPermissions.filter((item) => item !== permission) })} /><span>{t.permissionNames?.[permission] || permission}</span></label>)}
        </fieldset>
        </div>
        <div className="confirm-actions"><button type="button" className="outline" onClick={() => setEditing(null)}>{t.cancel}</button>
          <button type="submit" className="driver-modal-submit" disabled={busy}><Save size={17} />{busy ? t.loading : editing._id ? t.save : (t.addManager || 'Add administrator')}</button></div>
      </form>
    </div>}
  </section>
}
