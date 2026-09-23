import React, { useCallback, useMemo, useState } from 'react'
import {
  BadgeCheck, ChevronDown, Download, FileText, Lock, Search, ShieldAlert, X,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
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

export default function DriverManagement() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [approval, setApproval] = useState('all')
  const [detail, setDetail] = useState(null)
  const [pendingAction, setPendingAction] = useState(null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const fetcher = useCallback(() => api.drivers({ limit: 200 }), [])
  const { data, error, loading, reload } = useApiResource(fetcher)
  useRealtimeEvent(LIVE_EVENTS, reload)

  const drivers = useMemo(() => (Array.isArray(data) ? data : data?.drivers || []), [data])

  const filtered = useMemo(() => drivers.filter((driver) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [
      driverName(driver), driver.phoneNumber, driver.licenseNumber, driver.email,
    ].some((value) => String(value || '').toLowerCase().includes(query))

    const matchesApproval =
      approval === 'all' ||
      (approval === 'approved' && driver.isVerified) ||
      (approval === 'pending' && !driver.isVerified)

    return matchesSearch && matchesApproval
  }), [drivers, search, approval])

  const pendingCount = useMemo(
    () => drivers.filter((d) => !d.isVerified).length,
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

  const toggleBlock = async (driver) => {
    setBusy(true)
    try {
      await api.toggleDriverBlock(driver._id)
      await reload()
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
      driver.isVerified ? t.approved : t.pendingApproval,
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
      <button onClick={() => setApproval('pending')}>{t.filter}</button>
    </section>}

    <section className="panel driver-toolbar">
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <label>
        <select value={approval} onChange={(event) => setApproval(event.target.value)}>
          <option value="all">{t.allStatuses}</option>
          <option value="approved">{t.approved}</option>
          <option value="pending">{t.pendingApproval}</option>
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
    </section>

    {actionError && <div className="login-error">{actionError}</div>}

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
                    <span className={`driver-status ${driver.isVerified ? 'available' : 'unavailable'}`}>
                      ● {driver.isVerified ? t.approved : t.pendingApproval}
                    </span>
                    {missing.length > 0 && <small className="doc-warning">
                      {missing.length} {t.documentsMissing}
                    </small>}
                  </td>
                  <td className="row-actions">
                    <button className="details" onClick={() => setDetail(driver)}>{t.details}</button>
                    {driver.isVerified
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
                    <button className="lock" disabled={busy} onClick={() => toggleBlock(driver)}>
                      <Lock size={14} />
                    </button>
                  </td>
                </tr>
              })}
        </tbody>
      </table></div>
    </section>

    {detail && <DriverDetail driver={detail} t={t} onClose={() => setDetail(null)} />}

    {pendingAction && <ApprovalDialog
      action={pendingAction}
      t={t}
      busy={busy}
      onCancel={() => setPendingAction(null)}
      onConfirm={(reason) => runApproval(pendingAction.driver, pendingAction.approved, reason)}
    />}
  </div>
}

function DriverDetail({ driver, t, onClose }) {
  return <div className="driver-modal-backdrop" onMouseDown={onClose}>
    <div className="driver-modal" onMouseDown={(event) => event.stopPropagation()}>
      <div className="driver-modal-head">
        <h2>{driverName(driver)}</h2>
        <button type="button" onClick={onClose}><X /></button>
      </div>

      <div className="detail-grid">
        <div><small>{t.phone}</small><b>{driver.phoneNumber}</b></div>
        <div><small>{t.email}</small><b>{driver.email || '—'}</b></div>
        <div><small>{t.headers[4]}</small><b>{driver.licenseNumber || '—'}</b></div>
        <div><small>{t.headers[5]}</small><b>{driver.totalTrips ?? 0}</b></div>
        <div><small>{t.headers[6]}</small><b>{formatIls(driver.totalEarnings)}</b></div>
        <div>
          <small>{t.headers[7]}</small>
          <b>{driver.isVerified ? t.approved : t.pendingApproval}</b>
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
    </div>
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
