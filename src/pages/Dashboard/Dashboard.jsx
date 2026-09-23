import React, { useCallback, useMemo, useState } from 'react'
import { AlertTriangle, Trophy } from 'lucide-react'
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

export default function Dashboard() {
  const { t, language } = useLanguage()
  const [chartPeriod, setChartPeriod] = useState('week')

  const fetcher = useCallback(() => api.dashboard(), [])
  const { data, error, loading, reload } = useApiResource(fetcher)

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
              return <div className="activity" key={trip._id}>
                <span className={`activity-icon ${cancelled ? 'danger' : 'peach'}`}>
                  {cancelled ? <AlertTriangle /> : <img src={asset("assets/dashboard_icon/truck.png?v=2")} alt="" />}
                </span>
                <div>
                  <b>#{trip.tripNumber} · {trip.customerId?.name || '—'}</b>
                  <small>{trip.pickupAddress} · {formatDateTime(trip.createdAt)}</small>
                </div>
                <strong className={cancelled ? 'cancelled' : ''}>
                  {cancelled ? statusLabel(trip.status, t) : formatIls(trip.price)}
                </strong>
              </div>
            })}
      </article>

      <article className="panel top-drivers">
        <div className="panel-head"><h2>{t.topDrivers}</h2><Trophy className="trophy" /></div>
        <div className="leader-list">
          {(data?.topDrivers || []).length === 0
            ? <p className="empty-row">{t.noResults}</p>
            : data.topDrivers.map((driver, i) => {
                const name = `${driver.firstName || ''} ${driver.lastName || ''}`.trim()
                return <div className="leader" key={driver._id}>
                  <span className={`rank r${i + 1}`}>{i + 1}</span>
                  <Avatar text={initialsOf(name)} color={avatarColor(driver._id)} />
                  <div><b>{name}</b><small>{driver.totalTrips} {t.towCount}</small></div>
                  <strong>{formatIls(driver.totalEarnings)}</strong>
                </div>
              })}
        </div>
      </article>
    </section>
  </div>
}
