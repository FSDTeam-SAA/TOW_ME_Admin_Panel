import React, { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Trophy, X } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import { useRealtimeEvent } from '../../realtime/RealtimeContext'
import { initialsOf, avatarColor, formatIls, formatDateTime, statusLabel } from '../../utils/format'
import PageState from '../../components/common/PageState'
import { asset } from '../../utils/asset'

const dashboardIcons = ['truck.png', 'isrial_currency.png', 'tikmark.png', 'star.png']
const LIVE_EVENTS = ['trip:created', 'trip:updated', 'driver:updated']

function DetailField({ label, value }) {
  if (value === undefined || value === null || value === '') return null
  return <div><small>{label}</small><b>{value}</b></div>
}

function MetricIcon({ index }) {
  return <div className={`metric-icon ${['peach', 'silver', 'mint', 'ice'][index]}`}>
    <img src={asset(`assets/dashboard_icon/${dashboardIcons[index]}?v=2`)} alt="" />
  </div>
}

/** Plots the last 7 days of revenue, scaled to the largest day. */
function LineChart({ trend }) {
  const points = useMemo(() => {
    if (!trend?.length) return null
    const max = Math.max(...trend.map(d => d.revenue), 1)
    const step = 680 / Math.max(trend.length - 1, 1)
    const coords = trend.map((day, index) => {
      const x = 30 + index * step
      const y = 170 - (day.revenue / max) * 140
      return [Math.round(x), Math.round(y)]
    })
    return {
      max,
      line: coords.map(([x, y]) => `${x},${y}`).join(' '),
      area: `M${coords[0][0]} ${coords[0][1]} ${coords.slice(1).map(([x, y]) => `L${x} ${y}`).join(' ')} L${coords.at(-1)[0]} 180 L${coords[0][0]} 180Z`,
    }
  }, [trend])

  const axis = points
    ? [points.max, points.max * 0.66, points.max * 0.33, 0].map(v => formatIls(v, true))
    : ['0', '0', '0', '0']

  return <div className="line-chart">
    <div className="line-y-axis">{axis.map((label, i) => <span key={i}>{label}</span>)}</div>
    <svg viewBox="0 0 720 190" preserveAspectRatio="none">
      {[30, 80, 130, 180].map(y => <line key={y} x1="30" y1={y} x2="710" y2={y} className="grid-line" />)}
      {points && <>
        <path d={points.area} className="area" />
        <polyline points={points.line} className="orange-line" />
      </>}
    </svg>
    <div className="chart-labels">
      {(trend || []).map(day => <span key={day.date}>{day.date.slice(5)}</span>)}
    </div>
  </div>
}

function Donut({ distribution, t }) {
  const items = distribution?.length ? distribution : []
  const colors = ['orange', 'navy', 'cyan', 'gray']
  return <div className="pie-wrap">
    <div className="pie">
      {items.slice(0, 4).map((item) => (
        <span key={item.type} className={`p${item.percent}`}>{item.percent}%</span>
      ))}
    </div>
    <div className="legend">
      {items.length === 0
        ? <span>{t.noResults}</span>
        : items.slice(0, 4).map((item, i) => (
            <span key={item.type}><i className={colors[i]} />{item.type} · {item.percent}%</span>
          ))}
    </div>
  </div>
}

export default function Dashboard({ onManageDrivers }) {
  const { t, language } = useLanguage()
  const [chartPeriod, setChartPeriod] = useState('week')
  const [selectedTrip, setSelectedTrip] = useState(null)
  const [detailError, setDetailError] = useState('')

  const openTrip = async (id) => {
    setDetailError('')
    try {
      const response = await api.trip(id)
      setSelectedTrip(response.data)
    } catch (err) {
      setDetailError(err.message)
    }
  }

  const fetcher = useCallback(() => api.dashboard(), [])
  const { data, error, loading, refreshing, reload } = useApiResource(fetcher, {
    queryKey: ['dashboard'], staleTime: 30_000,
  })

  useRealtimeEvent(LIVE_EVENTS, reload)

  const stats = data?.stats
  const metrics = useMemo(() => [
    [String(stats?.todayTrips ?? 0), t.metrics[0][1], `${t.metrics[0][2].split(' ')[0]} ${stats?.totalTrips ?? 0}`],
    [formatIls(stats?.todayRevenue ?? 0), t.metrics[1][1], `${stats?.revenueChangePercent ?? 0}%`],
    [String(stats?.availableDrivers ?? 0), t.metrics[2][1], `${language === 'he' ? 'מתוך' : 'of'} ${stats?.totalDrivers ?? 0}`],
    [String(stats?.avgRating ?? 0), t.metrics[3][1], '★'.repeat(Math.round(stats?.avgRating ?? 0))],
  ], [stats, t, language])

  if (loading || error) {
    return <div className="content dashboard-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content dashboard-page">
    {refreshing && <span className="sr-only" role="status">{t.loading}</span>}
    <section className="stats">{metrics.map((metric, i) => <article key={metric[1]}>
      <MetricIcon index={i} />
      {i === 1
        ? <strong className="currency-value"><img src={asset("assets/dashboard_icon/isrial_currency.png?v=2")} alt="" /><span>{metric[0].replace(/^[₪$]/, '')}</span></strong>
        : <strong>{metric[0]}</strong>}
      <p>{metric[1]}</p>
      {i === 3 ? <div className="stars">{metric[2]}</div> : <small className={i < 2 ? 'up' : ''}>{metric[2]}</small>}
    </article>)}</section>

    <section className="charts">
      <article className="panel revenue-panel">
        <div className="panel-head">
          <h2>{t.weeklyRevenue}</h2>
          <div className="tabs">
            <button className={chartPeriod === 'week' ? 'selected' : ''} onClick={() => setChartPeriod('week')}>{t.thisWeek}</button>
          </div>
        </div>
        <LineChart trend={data?.weeklyRevenueTrend} />
      </article>
      <article className="panel pie-panel">
        <h2>{t.towTypes}</h2>
        <Donut distribution={data?.tripTypeDistribution} t={t} />
      </article>
    </section>

    <section className="lower-grid">
      <article className="panel recent">
        <div className="panel-head"><h2>{t.recentTows}</h2></div>
        {(data?.recentTrips || []).length === 0
          ? <p className="empty-row">{t.noResults}</p>
          : data.recentTrips.map(trip => {
              const cancelled = trip.status === 'cancelled'
              return <button type="button" className="activity activity-button" key={trip._id} onClick={() => openTrip(trip._id)}>
                <span className={`activity-icon ${cancelled ? 'danger' : 'peach'}`}>
                  {cancelled ? <AlertTriangle /> : <img src={asset("assets/dashboard_icon/truck.png?v=2")} alt="" />}
                </span>
                <div>
                  <b>#{trip.tripNumber} · {trip.customerId?.name || '—'}</b>
                  <small>{trip.pickupLocation?.address || trip.pickupAddress} · {formatDateTime(trip.createdAt)}</small>
                </div>
                <strong className={cancelled ? 'cancelled' : ''}>
                  {cancelled ? statusLabel(trip.status, t) : formatIls(trip.price)}
                </strong>
              </button>
            })}
      </article>

      <article className="panel top-drivers">
        <div className="panel-head"><h2>{t.topDrivers}</h2><Trophy className="trophy" /></div>
        <div className="leader-list">
          {(data?.topDrivers || []).length === 0
            ? <p className="empty-row">{t.noResults}</p>
            : data.topDrivers.map((driver, i) => {
                const name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
                return <button type="button" className="leader leader-button" key={driver._id} onClick={() => onManageDrivers(driver._id)}>
                  <span className={`rank r${i + 1}`}>{i + 1}</span>
                  <Avatar text={initialsOf(name)} color={avatarColor(driver._id)} />
                  <div><b>{name}</b><small>{driver.totalTrips} {t.towCount}</small></div>
                  <strong>{formatIls(driver.totalEarnings)}</strong>
                  <span>{t.details}</span>
                </button>
              })}
        </div>
      </article>
    </section>
    {detailError && <div className="login-error">{detailError}</div>}
    {selectedTrip && <div className="driver-modal-backdrop" onMouseDown={() => setSelectedTrip(null)}>
      <div className="driver-modal" onMouseDown={(event) => event.stopPropagation()}>
        <div className="driver-modal-head"><h2>#{selectedTrip.tripNumber}</h2><button onClick={() => setSelectedTrip(null)}><X /></button></div>
        <div className="detail-grid">
          <div><small>{t.cmHeaders[1]}</small><b>{selectedTrip.customerId?.name || '—'}</b></div>
          <DetailField label={t.towDetail.contactName} value={selectedTrip.contactInfo?.name || selectedTrip.customerId?.name} />
          <DetailField label={t.towDetail.contactLastFour} value={(selectedTrip.contactInfo?.phoneNumber || selectedTrip.customerId?.phoneNumber || '').replace(/\D/g, '').slice(-4) || '—'} />
          <div><small>{t.tripType || 'Type'}</small><b>{selectedTrip.tripType || '—'}</b></div>
          <div><small>{t.fromDate}</small><b>{formatDateTime(selectedTrip.createdAt)}</b></div>
          <div><small>{t.headers[4]}</small><b>{selectedTrip.vehicleInfo?.licensePlate || '—'}</b></div>
          <div><small>{t.vehicle || 'Vehicle'}</small><b>{[selectedTrip.vehicleInfo?.make, selectedTrip.vehicleInfo?.model].filter(Boolean).join(' ') || '—'}</b></div>
          <DetailField label={t.towDetail.vehicleType} value={selectedTrip.vehicleInfo?.type} />
          <DetailField label={t.towDetail.vehicleColor} value={selectedTrip.vehicleInfo?.color} />
          <DetailField label={t.towDetail.vehicleYear} value={selectedTrip.vehicleInfo?.year} />
          <div><small>{t.headers[7]}</small><b>{statusLabel(selectedTrip.status, t)}</b></div>
          <div><small>{t.financeTitle}</small><b>{formatIls(selectedTrip.price)}</b></div>
          <DetailField label={t.towDetail.paymentMethod} value={selectedTrip.paymentMethod || '—'} />
          <DetailField label={t.towDetail.paymentStatus} value={selectedTrip.paymentStatus || '—'} />
          <DetailField label={t.towDetail.bookingSource} value={selectedTrip.bookingSource || '—'} />
          <div><small>Pickup</small><b>{selectedTrip.pickupLocation?.address || '—'}</b></div>
          <div><small>Destination</small><b>{selectedTrip.dropoffLocation?.address || '—'}</b></div>
          <div><small>{t.driverManagement}</small><b>{[selectedTrip.driverId?.firstName, selectedTrip.driverId?.lastName].filter(Boolean).join(' ') || '—'}</b></div>
          <DetailField label={t.towDetail.driverPhone} value={selectedTrip.driverId?.phoneNumber} />
          <DetailField label={t.towDetail.distance} value={selectedTrip.estimatedDistance ? `${selectedTrip.estimatedDistance} ${t.towDetail.kilometers}` : null} />
          <DetailField label={t.towDetail.duration} value={selectedTrip.estimatedDuration ? `${selectedTrip.estimatedDuration} ${t.towDetail.minutes}` : null} />
          <DetailField label={t.towDetail.acceptedAt} value={selectedTrip.acceptedAt && formatDateTime(selectedTrip.acceptedAt)} />
          <DetailField label={t.towDetail.arrivedAt} value={selectedTrip.arrivedAt && formatDateTime(selectedTrip.arrivedAt)} />
          <DetailField label={t.towDetail.startedAt} value={selectedTrip.startedAt && formatDateTime(selectedTrip.startedAt)} />
          <DetailField label={t.towDetail.completedAt} value={selectedTrip.completedAt && formatDateTime(selectedTrip.completedAt)} />
          <DetailField label={t.towDetail.cancelledAt} value={selectedTrip.cancelledAt && formatDateTime(selectedTrip.cancelledAt)} />
          <DetailField label={t.towDetail.cancellationFee} value={selectedTrip.cancellationFee ? formatIls(selectedTrip.cancellationFee) : null} />
          <DetailField label={t.towDetail.cancellationReason} value={selectedTrip.cancellationReason} />
          <DetailField label={t.towDetail.notes} value={selectedTrip.notes} />
          <DetailField label={t.towDetail.completionComments} value={selectedTrip.completionReport?.comments} />
        </div>
        {selectedTrip.destinationHistory?.length > 0 && <div className="driver-trip-history">
          <h3 className="detail-section">{t.towDetail.destinationHistory}</h3>
          {selectedTrip.destinationHistory.map((entry, index) => <p key={`${entry.changedAt || ''}-${index}`}>
            {entry.address} · {formatIls(entry.price)} · {entry.changedAt ? formatDateTime(entry.changedAt) : ''}
          </p>)}
        </div>}
      </div>
    </div>}
  </div>
}
