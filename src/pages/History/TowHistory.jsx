import React, { useCallback, useMemo, useState } from 'react'
import { CalendarDays, ChevronDown, Download, Search, UserPlus, X, XCircle } from 'lucide-react'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import { useRealtimeEvent } from '../../realtime/RealtimeContext'
import {
  downloadCsv, driverName, formatDateTime, formatIls,
  statusClass, statusLabel, TRIP_STATUSES,
} from '../../utils/format'

const LIVE_EVENTS = ['trip:created', 'trip:updated']
const CANCELLABLE = ['pending', 'accepted', 'arrived', 'in_progress']

export default function TowHistory() {
  const { t } = useLanguage()
  const [filters, setFilters] = useState({ search: '', status: 'all', from: '', to: '' })
  const [cancelling, setCancelling] = useState(null)
  const [assigning, setAssigning] = useState(null)
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState(false)

  const fetcher = useCallback(() => api.trips({
    limit: 100,
    status: filters.status === 'all' ? undefined : filters.status,
    search: filters.search.trim() || undefined,
    fromDate: filters.from || undefined,
    toDate: filters.to || undefined,
  }), [filters])

  const { data, error, loading, reload } = useApiResource(fetcher)
  useRealtimeEvent(LIVE_EVENTS, reload)

  const trips = useMemo(() => data?.trips || [], [data])
  const stats = data?.stats

  const update = (key, value) => setFilters((current) => ({ ...current, [key]: value }))

  const cancelTrip = async (reason) => {
    setBusy(true)
    setActionError('')
    try {
      await api.adminCancelTrip(cancelling._id, reason)
      await reload()
      setCancelling(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const assignDriver = async (driverId) => {
    setBusy(true)
    setActionError('')
    try {
      await api.assignDriver(assigning._id, driverId)
      await reload()
      setAssigning(null)
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const exportRows = () => downloadCsv('tow-me-bookings.csv', [
    ['#', 'Booking', 'Customer', 'Driver', 'From', 'To', 'Price', 'Status', 'Created'],
    ...trips.map((trip, index) => [
      index + 1,
      trip.tripNumber,
      trip.customerId?.name,
      driverName(trip.driverId),
      trip.pickupAddress,
      trip.dropoffAddress,
      trip.price,
      trip.status,
      formatDateTime(trip.createdAt),
    ]),
  ])

  if (loading || error) {
    return <div className="content drivers-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content drivers-page">
    {stats && <section className="driver-metrics">
      {[
        [stats.total, t.allStatuses],
        [stats.completed, statusLabel('completed', t)],
        [stats.pending, statusLabel('pending', t)],
        [`${stats.cancellationRate}%`, statusLabel('cancelled', t)],
      ].map(([value, label]) => <article className="panel" key={label}>
        <strong>{value}</strong><p>{label}</p>
      </article>)}
    </section>}

    <section className="panel driver-toolbar">
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <label>
        <select value={filters.status} onChange={(event) => update('status', event.target.value)}>
          <option value="all">{t.allStatuses}</option>
          {TRIP_STATUSES.map((status) => (
            <option value={status} key={status}>{statusLabel(status, t)}</option>
          ))}
        </select>
        <ChevronDown size={16} />
      </label>
      <label className="date-field">
        <CalendarDays size={16} />
        <input type="date" value={filters.from} aria-label={t.fromDate}
          onChange={(event) => update('from', event.target.value)} />
      </label>
      <label className="date-field">
        <CalendarDays size={16} />
        <input type="date" value={filters.to} aria-label={t.toDate}
          onChange={(event) => update('to', event.target.value)} />
      </label>
      <label className="driver-search">
        <input value={filters.search} placeholder={t.search}
          onChange={(event) => update('search', event.target.value)} />
        <Search size={18} />
      </label>
    </section>

    {actionError && <div className="login-error">{actionError}</div>}

    <section className="panel full-drivers-table">
      <div className="full-drivers-head">
        <h2>{t.nav[3]}</h2>
        <p>{trips.length}</p>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>
          <th>#</th><th>{t.nav[3]}</th><th>{t.cmHeaders[1]}</th><th>{t.headers[1]}</th>
          <th>{t.fromDate}</th><th>{t.toDate}</th><th>{t.headers[6]}</th>
          <th>{t.headers[7]}</th><th>{t.headers[8]}</th>
        </tr></thead>
        <tbody>
          {trips.length === 0
            ? <tr><td colSpan={9} className="empty-row">{t.noResults}</td></tr>
            : trips.map((trip, index) => <tr key={trip._id}>
                <td>{index + 1}</td>
                <td><mark>#{trip.tripNumber}</mark><small>{formatDateTime(trip.createdAt)}</small></td>
                <td>{trip.customerId?.name || '—'}<small>{trip.customerId?.phoneNumber}</small></td>
                <td>{driverName(trip.driverId)}</td>
                <td className="address-cell">{trip.pickupAddress || '—'}</td>
                <td className="address-cell">{trip.dropoffAddress || '—'}</td>
                <td>
                  <b>{formatIls(trip.price)}</b>
                  {trip.cancellationFee > 0 && <small className="doc-warning">
                    {t.cancelTrip}: {formatIls(trip.cancellationFee)}
                  </small>}
                </td>
                <td><span className={`driver-status ${statusClass(trip.status)}`}>
                  ● {statusLabel(trip.status, t)}
                </span></td>
                <td className="row-actions">
                  {!trip.driverId && CANCELLABLE.includes(trip.status) && (
                    <button className="details" onClick={() => setAssigning(trip)}>
                      <UserPlus size={14} />{t.assignDriver}
                    </button>
                  )}
                  {CANCELLABLE.includes(trip.status) && (
                    <button className="lock" onClick={() => setCancelling(trip)}>
                      <XCircle size={14} />{t.cancel}
                    </button>
                  )}
                </td>
              </tr>)}
        </tbody>
      </table></div>
    </section>

    {cancelling && <CancelDialog
      trip={cancelling} t={t} busy={busy}
      onCancel={() => setCancelling(null)} onConfirm={cancelTrip}
    />}

    {assigning && <AssignDialog
      trip={assigning} t={t} busy={busy}
      onCancel={() => setAssigning(null)} onConfirm={assignDriver}
    />}
  </div>
}

function CancelDialog({ trip, t, busy, onCancel, onConfirm }) {
  const [reason, setReason] = useState('')
  return <div className="driver-modal-backdrop" onMouseDown={onCancel}>
    <form className="driver-modal confirm-modal"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={(event) => { event.preventDefault(); onConfirm(reason) }}>
      <div className="driver-modal-head">
        <h2>{t.cancelTrip}</h2>
        <button type="button" onClick={onCancel}><X /></button>
      </div>
      <b className="confirm-subject">#{trip.tripNumber}</b>
      <label>
        <span>{t.cancelTripReason}</span>
        <input value={reason} onChange={(event) => setReason(event.target.value)} required />
      </label>
      <div className="confirm-actions">
        <button type="button" className="outline" onClick={onCancel}>{t.close}</button>
        <button type="submit" className="driver-modal-submit" disabled={busy}>
          {busy ? t.loading : t.confirm}
        </button>
      </div>
    </form>
  </div>
}

function AssignDialog({ trip, t, busy, onCancel, onConfirm }) {
  const [driverId, setDriverId] = useState('')
  const fetcher = useCallback(() => api.drivers({ limit: 200 }), [])
  const { data, loading } = useApiResource(fetcher)

  // Only approved, unblocked drivers can take a job.
  const options = useMemo(
    () => (data?.drivers || []).filter((d) => d.isVerified && !d.isBlocked),
    [data],
  )

  return <div className="driver-modal-backdrop" onMouseDown={onCancel}>
    <form className="driver-modal confirm-modal"
      onMouseDown={(event) => event.stopPropagation()}
      onSubmit={(event) => { event.preventDefault(); onConfirm(driverId) }}>
      <div className="driver-modal-head">
        <h2>{t.assignDriver}</h2>
        <button type="button" onClick={onCancel}><X /></button>
      </div>
      <b className="confirm-subject">#{trip.tripNumber}</b>
      <label>
        <span>{t.selectDriver}</span>
        <select value={driverId} onChange={(event) => setDriverId(event.target.value)} required>
          <option value="">{loading ? t.loading : t.selectDriver}</option>
          {options.map((driver) => (
            <option value={driver._id} key={driver._id}>
              {driverName(driver)} · {driver.phoneNumber}
            </option>
          ))}
        </select>
      </label>
      <div className="confirm-actions">
        <button type="button" className="outline" onClick={onCancel}>{t.close}</button>
        <button type="submit" className="driver-modal-submit" disabled={busy || !driverId}>
          {busy ? t.loading : t.confirm}
        </button>
      </div>
    </form>
  </div>
}
