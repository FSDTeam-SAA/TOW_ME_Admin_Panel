import React, { useCallback, useEffect, useMemo, useState } from 'react'
import {
  BadgeCheck, ChevronDown, Download, FileText, Lock, Search, ShieldAlert, UserPlus, X,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import PageState from '../../components/common/PageState'
import TripHistoryList from '../../components/common/TripHistoryList'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import useApiResource from '../../hooks/useApiResource'
import { useRealtimeEvent } from '../../realtime/RealtimeContext'
import {
  avatarColor, downloadCsv, driverName, formatIls, initialsOf,
} from '../../utils/format'

const LIVE_EVENTS = ['driver:updated']

const DOCUMENTS = [
  ['vehicleRegistration', 'vehicleLicense'],
  ['insuranceDocument', 'mandatoryInsurance'],
  ['cargoInsuranceDocument', 'cargoInsurance'],
  ['thirdPartyInsuranceDocument', 'thirdPartyInsurance'],
]

const missingDocuments = (driver) =>
  DOCUMENTS.filter(([field]) => !driver?.[field]?.url)
const isLocked = (driver) => Boolean(driver.isBlocked || driver.userId?.isBlocked)

export default function DriverManagement({ initialDriverId }) {
  const { t, language } = useLanguage()
  const { user } = useAuth()
  const [search, setSearch] = useState('')
  const [approval, setApproval] = useState('all')
  const [city, setCity] = useState('')
  const [detail, setDetail] = useState(null)
  const [editing, setEditing] = useState(null)
  const [detailError, setDetailError] = useState('')
  const [pendingAction, setPendingAction] = useState(null)
  const [lockAction, setLockAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  useEffect(() => {
    if (!initialDriverId) return
    let active = true
    api.driver(initialDriverId)
      .then((response) => { if (active) setDetail(response.data) })
      .catch((err) => { if (active) setDetailError(err.message) })
    return () => { active = false }
  }, [initialDriverId])

  const fetcher = useCallback(() => api.drivers({ limit: 200, city: city.trim() || undefined }), [city])
  const { data, error, loading, reload } = useApiResource(fetcher, {
    queryKey: ['drivers', { city }],
  })
  useRealtimeEvent(LIVE_EVENTS, reload)

  const drivers = useMemo(() => (Array.isArray(data) ? data : data?.drivers || []), [data])

  const filtered = useMemo(() => drivers.filter((driver) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [
      driverName(driver), driver.phoneNumber, driver.licenseNumber, driver.email,
    ].some((value) => String(value || '').toLowerCase().includes(query))

    const matchesApproval =
      approval === 'all' ||
      (approval === 'approved' && driver.isVerified && !isLocked(driver)) ||
      (approval === 'pending' && !driver.isVerified && !isLocked(driver)) ||
      (approval === 'locked' && isLocked(driver))

    return matchesSearch && matchesApproval
  }), [drivers, search, approval])

  const pendingCount = useMemo(
    () => drivers.filter((d) => !d.isVerified && !isLocked(d)).length,
    [drivers],
  )

  const runApproval = async (driver, approved, reason) => {
    setBusy(true)
    setActionError('')
    try {
      await api.setDriverApproval(driver._id, approved, reason)
      await reload()
      setPendingAction(null)
      setDetail(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const toggleBlock = async (driver, code) => {
    setBusy(true)
    setActionError('')
    try {
      await api.toggleDriverBlock(driver._id, code)
      await reload()
      setLockAction(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const openDetail = async (driver) => {
    setDetailError('')
    try {
      const response = await api.driver(driver._id)
      setDetail(response.data)
    } catch (err) {
      setDetailError(err.message)
    }
  }

  const saveDriver = async (form) => {
    setBusy(true)
    setActionError('')
    try {
      if (editing._id) await api.updateDriver(editing._id, form)
      else await api.createDriver(form)
      await reload()
      setEditing(null)
      setDetail(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const exportRows = () => downloadCsv('tow-me-drivers.csv', [
    ['#', 'Name', 'Phone', 'License', 'Trips', 'Earnings', 'Approval', 'Documents'],
    ...filtered.map((driver, index) => [
      index + 1,
      driverName(driver),
      driver.phoneNumber,
      driver.licenseNumber,
      driver.totalTrips,
      driver.totalEarnings,
      isLocked(driver) ? (t.locked || 'Locked') : driver.isVerified ? t.approved : t.pendingApproval,
      missingDocuments(driver).length === 0 ? 'complete' : 'missing',
    ]),
  ])

  if (loading || error) {
    return <div className="content drivers-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content drivers-page">
    {pendingCount > 0 && <section className="panel approval-banner">
      <ShieldAlert size={19} />
      <b>{pendingCount}</b>
      <span>{t.pendingApproval}</span>
      <button onClick={() => setApproval('pending')}>{t.enter || 'Enter'}</button>
    </section>}

    <section className="panel driver-toolbar">
      {user?.isMasterAdmin && <button className="outline" onClick={() => setEditing({})}><UserPlus size={17} />{t.addDriver || 'Add driver'}</button>}
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <label>
        <select value={approval} onChange={(event) => setApproval(event.target.value)}>
          <option value="all">{t.allStatuses}</option>
          <option value="approved">{t.approved}</option>
          <option value="pending">{t.pendingApproval}</option>
          <option value="locked">{t.locked || 'Locked'}</option>
        </select>
        <ChevronDown size={16} />
      </label>
      <label className="driver-search">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.driverSearch}
        />
        <Search size={18} />
      </label>
      <label className="driver-search">
        <input value={city} onChange={(event) => setCity(event.target.value)} placeholder={t.city || 'City'} />
        <Search size={18} />
      </label>
    </section>

    {actionError && <div className="login-error">{actionError}</div>}
    {detailError && <div className="login-error">{detailError}</div>}

    <section className="panel full-drivers-table">
      <div className="full-drivers-head">
        <h2>{t.driversTableTitle}</h2>
        <p>{filtered.length}</p>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>
          <th>#</th><th>{t.headers[1]}</th><th>{t.phone}</th><th>{t.headers[4]}</th>
          <th>{t.headers[5]}</th><th>{t.headers[6]}</th><th>{t.headers[7]}</th><th>{t.headers[8]}</th>
        </tr></thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={8} className="empty-row">{t.noResults}</td></tr>
            : filtered.map((driver, index) => {
                const missing = missingDocuments(driver)
                return <tr key={driver._id}>
                  <td>{index + 1}</td>
                  <td className="driver-name">
                    <Avatar text={initialsOf(driverName(driver))} color={avatarColor(driver._id)} />
                    <b>{driverName(driver)}</b>
                  </td>
                  <td>{driver.phoneNumber}</td>
                  <td><mark>{driver.licenseNumber || '—'}</mark></td>
                  <td><b>{driver.totalTrips ?? 0}</b></td>
                  <td><b>{formatIls(driver.totalEarnings)}</b></td>
                  <td>
                    <span className={`driver-status ${driver.isVerified && !isLocked(driver) ? 'available' : 'unavailable'}`}>
                      ● {isLocked(driver) ? (t.locked || 'Locked') : driver.isVerified ? t.approved : t.pendingApproval}
                    </span>
                    {missing.length > 0 && <small className="doc-warning">
                      {missing.length} {t.documentsMissing}
                    </small>}
                  </td>
                  <td className="row-actions">
                    <button className="details" onClick={() => openDetail(driver)}>{t.details}</button>
                    {isLocked(driver)
                      ? null
                      : driver.isVerified
                      ? <button
                          className="lock"
                          disabled={busy}
                          onClick={() => setPendingAction({ driver, approved: false })}
                        >{t.reject}</button>
                      : <button
                          className="approve"
                          disabled={busy}
                          onClick={() => setPendingAction({ driver, approved: true })}
                        ><BadgeCheck size={15} />{t.approve}</button>}
                    <button className="lock" disabled={busy} onClick={() => setLockAction(driver)}>
                      <Lock size={14} />{isLocked(driver) ? (t.unlock || 'Unlock') : (t.lock || 'Lock')}
                    </button>
                  </td>
                </tr>
              })}
        </tbody>
      </table></div>
    </section>

    {detail && <DriverDetail driver={detail.driver} trips={detail.recentTrips} t={t} language={language} onClose={() => setDetail(null)} onEdit={() => { setEditing(detail.driver); setDetail(null) }} />}
    {editing && <DriverForm driver={editing} t={t} busy={busy} onClose={() => setEditing(null)} onSave={saveDriver} />}

    {pendingAction && <ApprovalDialog
      action={pendingAction}
      t={t}
      busy={busy}
      onCancel={() => setPendingAction(null)}
      onConfirm={(reason) => runApproval(pendingAction.driver, pendingAction.approved, reason)}
    />}
    {lockAction && <ManagerCodeDialog driver={lockAction} t={t} busy={busy}
      onCancel={() => setLockAction(null)} onConfirm={(code) => toggleBlock(lockAction, code)} />}
  </div>
}

function ManagerCodeDialog({ driver, t, busy, onCancel, onConfirm }) {
  const [code, setCode] = useState('')
  return <div className="driver-modal-backdrop" onMouseDown={onCancel}>
    <form className="driver-modal confirm-modal" onMouseDown={(event) => event.stopPropagation()}
      onSubmit={(event) => { event.preventDefault(); onConfirm(code) }}>
      <div className="driver-modal-head"><h2>{isLocked(driver) ? (t.unlock || 'Unlock') : (t.lock || 'Lock')} {driverName(driver)}</h2>
        <button type="button" onClick={onCancel}><X /></button></div>
      <label><span>{t.managerCode || 'Manager PIN or password'}</span>
        <input type="password" required autoFocus value={code} onChange={(event) => setCode(event.target.value)} /></label>
      <div className="confirm-actions"><button type="button" className="outline" onClick={onCancel}>{t.cancel}</button>
        <button type="submit" className="driver-modal-submit" disabled={busy}>{busy ? t.loading : t.confirm}</button></div>
    </form>
  </div>
}

function DriverDetail({ driver, trips = [], t, language, onClose, onEdit }) {
  return <div className="driver-modal-backdrop" onMouseDown={onClose}>
    <div className="driver-modal" onMouseDown={(event) => event.stopPropagation()}>
      <div className="driver-modal-head">
        <h2>{driverName(driver)}</h2>
        <div><button type="button" className="details" onClick={onEdit}>{t.edit || 'Edit'}</button><button type="button" onClick={onClose}><X /></button></div>
      </div>

      <div className="detail-grid">
        <div><small>{t.phone}</small><b>{driver.phoneNumber}</b></div>
        <div><small>{t.email}</small><b>{driver.email || '—'}</b></div>
        <div><small>{t.headers[4]}</small><b>{driver.licenseNumber || '—'}</b></div>
        <div><small>{t.headers[5]}</small><b>{driver.totalTrips ?? 0}</b></div>
        <div><small>{t.headers[6]}</small><b>{formatIls(driver.totalEarnings)}</b></div>
        <div>
          <small>{t.headers[7]}</small>
          <b>{isLocked(driver) ? (t.locked || 'Locked') : driver.isVerified ? t.approved : t.pendingApproval}</b>
        </div>
      </div>

      {driver.rejectionReason && <p className="login-error">{driver.rejectionReason}</p>}

      <h3 className="detail-section">{t.documents}</h3>
      <ul className="document-list">
        {DOCUMENTS.map(([field, labelKey]) => {
          const url = driver[field]?.url
          return <li key={field}>
            <FileText size={15} />
            <span>{t[labelKey]}</span>
            {url
              ? <a href={url} target="_blank" rel="noreferrer">{t.viewDocument}</a>
              : <em>{t.notUploaded}</em>}
          </li>
        })}
      </ul>
      <h3 className="detail-section">{t.historyTitle}</h3>
      <div className="driver-trip-history">
        <TripHistoryList trips={trips} t={t} language={language} />
      </div>
    </div>
  </div>
}

function DriverForm({ driver, t, busy, onClose, onSave }) {
  const isEdit = Boolean(driver._id)
  const [values, setValues] = useState({
    firstName: driver.firstName || '', lastName: driver.lastName || '',
    phoneNumber: driver.phoneNumber || '', email: driver.email || '',
    vehicleType: driver.vehicleType || 'regular', licenseNumber: driver.licenseNumber || '',
    operatingArea: (driver.operatingArea || []).join(', '), password: '',
  })
  const [files, setFiles] = useState({})
  const setValue = (field, value) => setValues((current) => ({ ...current, [field]: value }))
  const submit = (event) => {
    event.preventDefault()
    const form = new FormData()
    Object.entries(values).forEach(([key, value]) => {
      if (key === 'operatingArea') form.set(key, JSON.stringify(value.split(',').map((part) => part.trim()).filter(Boolean)))
      else if (value || key !== 'password') form.set(key, value)
    })
    Object.entries(files).forEach(([key, file]) => { if (file) form.set(key, file) })
    onSave(form)
  }

  return <div className="driver-modal-backdrop" onMouseDown={onClose}>
    <form className="driver-modal" onMouseDown={(event) => event.stopPropagation()} onSubmit={submit}>
      <div className="driver-modal-head"><h2>{isEdit ? (t.edit || 'Edit driver') : (t.addDriver || 'Add driver')}</h2><button type="button" onClick={onClose}><X /></button></div>
      <div className="driver-form-grid">
        {[
          ['firstName', 'First name'], ['lastName', 'Last name'], ['phoneNumber', t.phone],
          ['email', t.email], ['licenseNumber', 'License plate'], ['operatingArea', t.city || 'City / operating areas'],
        ].map(([field, label]) => <label key={field}><span>{label}</span><input value={values[field]} onChange={(event) => setValue(field, event.target.value)} required={['firstName', 'lastName', 'phoneNumber', 'licenseNumber'].includes(field)} /></label>)}
        <label><span>Vehicle type</span><select value={values.vehicleType} onChange={(event) => setValue('vehicleType', event.target.value)}><option value="regular">Regular</option><option value="flatbed">Flatbed</option><option value="heavy">Heavy</option></select></label>
        {!isEdit && <label><span>Password</span><input type="password" minLength={6} required value={values.password} onChange={(event) => setValue('password', event.target.value)} /></label>}
        {DOCUMENTS.map(([field, label]) => <label key={field}><span>{t[label]}</span><input type="file" accept="image/*,.pdf" onChange={(event) => setFiles((current) => ({ ...current, [field]: event.target.files?.[0] }))} /></label>)}
      </div>
      <div className="confirm-actions"><button type="button" className="outline" onClick={onClose}>{t.cancel}</button><button type="submit" className="driver-modal-submit" disabled={busy}>{busy ? t.loading : t.save}</button></div>
    </form>
  </div>
}

function ApprovalDialog({ action, t, busy, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')
  const { driver, approved } = action
  const missing = missingDocuments(driver)

  return <div className="driver-modal-backdrop" onMouseDown={onCancel}>
    <form
      className="driver-modal confirm-modal"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={(event) => { event.preventDefault(); onConfirm(reason) }}
    >
      <div className="driver-modal-head">
        <h2>{approved ? t.approve : t.reject}</h2>
        <button type="button" onClick={onCancel}><X /></button>
      </div>

      <p>{approved ? t.approveConfirm : t.rejectConfirm}</p>
      <b className="confirm-subject">{driverName(driver)}</b>

      {approved && missing.length > 0 && <div className="login-error">
        {t.documentsMissing}: {missing.map(([, key]) => t[key]).join(', ')}
      </div>}

      {!approved && <label>
        <span>{t.rejectReason}</span>
        <input value={reason} onChange={(event) => setReason(event.target.value)} />
      </label>}

      <div className="confirm-actions">
        <button type="button" className="outline" onClick={onCancel}>{t.cancel}</button>
        <button
          type="submit"
          className="driver-modal-submit"
          disabled={busy || (approved && missing.length > 0)}
        >
          {busy ? t.loading : t.confirm}
        </button>
      </div>
    </form>
  </div>
}
