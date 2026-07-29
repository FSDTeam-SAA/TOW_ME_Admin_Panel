import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Download, Filter, Search, Trophy,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const baseDrivers = [
  { id: 1, he: 'יוסי לוי', en: 'Yossi Levi', initials: 'YL', color: '#758178', phone: '050-123-4567', plate: '12–345–67', tows: 142, heRevenue: '₪38,540', enRevenue: '$38,540', live: true },
  { id: 2, he: 'מוחמד ג׳בר', en: 'Mohammed Jaber', initials: 'MJ', color: '#29231f', phone: '052-987-6543', plate: '98–765–43', tows: 98, heRevenue: '₪24,100', enRevenue: '$24,100', live: false },
  { id: 3, he: 'דוד ישראלי', en: 'David Israeli', initials: 'DI', color: '#6a6c4f', phone: '054-321-7890', plate: '55–444–11', tows: 217, heRevenue: '₪62,800', enRevenue: '$62,800', live: true },
]

const dashboardIcons = ['truck.png', 'isrial_currency.png', 'tikmark.png', 'star.png']

function MetricIcon({ index }) {
  return <div className={`metric-icon ${['peach', 'silver', 'mint', 'ice'][index]}`}>
    <img
      src={`/assets/dashboard_icon/${dashboardIcons[index]}?v=2`}
      alt=""
    />
  </div>
}

function LineChart({ labels, period }) {
  const weekly = {
    area: 'M30 108 L140 73 L250 92 L360 45 L470 61 L580 30 L710 64 L710 180 L30 180Z',
    revenue: '30,108 140,73 250,92 360,45 470,61 580,30 710,64',
    comparison: '30,124 140,95 250,102 360,76 470,86 580,58 710,88',
  }
  const monthly = {
    area: 'M30 92 L140 112 L250 68 L360 82 L470 43 L580 67 L710 36 L710 180 L30 180Z',
    revenue: '30,92 140,112 250,68 360,82 470,43 580,67 710,36',
    comparison: '30,118 140,128 250,96 360,105 470,74 580,91 710,62',
  }
  const data = period === 'month' ? monthly : weekly
  return <div className="line-chart">
    <div className="line-y-axis"><span>₪15k</span><span>₪10k</span><span>₪5k</span><span>₪0</span></div>
    <svg viewBox="0 0 720 190" preserveAspectRatio="none">
    {[30, 80, 130, 180].map(y => <line key={y} x1="30" y1={y} x2="710" y2={y} className="grid-line" />)}
    <path d={data.area} className="area" />
    <polyline points={data.revenue} className="orange-line" />
    <polyline points={data.comparison} className="blue-line" />
  </svg><div className="chart-labels">{labels.map(label => <span key={label}>{label}</span>)}</div></div>
}

function Donut({ labels }) {
  return <div className="pie-wrap"><div className="pie"><span className="p32">32%</span><span className="p28">28%</span><span className="p25">25%</span><span className="p15">15%</span></div>
    <div className="legend">{labels.map((label, i) => <span key={label}><i className={['orange', 'navy', 'cyan', 'gray'][i]} />{label}</span>)}</div></div>
}

export default function Dashboard() {
  const { t, language } = useLanguage()
  const drivers = baseDrivers.map(d => ({ ...d, name: d[language], revenue: d[`${language}Revenue`] }))
  const [filters, setFilters] = useState({ search: '', from: '', to: '', status: 'all' })
  const [appliedFilters, setAppliedFilters] = useState(filters)
  const [chartPeriod, setChartPeriod] = useState('week')
  const filteredDrivers = useMemo(() => drivers.filter(driver => {
    const query = appliedFilters.search.trim().toLowerCase()
    const matchesSearch = !query || [driver.name, driver.phone, driver.plate].some(value => String(value).toLowerCase().includes(query))
    const matchesStatus = appliedFilters.status === 'all' || (appliedFilters.status === 'available' ? driver.live : !driver.live)
    return matchesSearch && matchesStatus
  }), [drivers, appliedFilters])

  const updateFilter = (key, value) => setFilters(current => ({ ...current, [key]: value }))
  const exportDrivers = () => {
    const rows = [
      t.headers.slice(0, 8),
      ...filteredDrivers.map(driver => [driver.id, driver.name, '032-458-762', driver.phone, driver.plate, driver.tows, driver.revenue, driver.live ? t.available : t.unavailable]),
    ]
    const csv = rows.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const blob = new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'tow-me-drivers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }
  return <div className="content">
    <section className="stats">{t.metrics.map((metric, i) => <article key={metric[1]}>
      <MetricIcon index={i} />
      {i === 1
        ? <strong className="currency-value"><img src="/assets/dashboard_icon/isrial_currency.png?v=2" alt="" /><span>{metric[0].replace(/^[₪$]/, '')}</span></strong>
        : <strong>{metric[0]}</strong>}
      <p>{metric[1]}</p>{i === 3 ? <div className="stars">{metric[2]}</div> : <small className={i < 2 ? 'up' : ''}>{metric[2]}</small>}
    </article>)}</section>

    <section className="charts">
      <article className="panel revenue-panel"><div className="panel-head"><h2>{t.weeklyRevenue}</h2><div className="tabs"><button className={chartPeriod === 'week' ? 'selected' : ''} onClick={() => setChartPeriod('week')}>{t.thisWeek}</button><button className={chartPeriod === 'month' ? 'selected' : ''} onClick={() => setChartPeriod('month')}>{t.lastMonth}</button></div></div><LineChart labels={t.weekdays} period={chartPeriod} /></article>
      <article className="panel pie-panel"><h2>{t.towTypes}</h2><Donut labels={t.towLegend} /></article>
    </section>

    <section className="filters panel">
      <button className="outline" onClick={exportDrivers}><Download size={17} />{t.export}</button>
      <button className="filter-btn" onClick={() => setAppliedFilters(filters)}><Filter size={16} />{t.filter}</button>
      <label className="select-field"><select value={filters.status} onChange={event => updateFilter('status', event.target.value)}><option value="all">{t.allStatuses}</option><option value="available">{t.available}</option><option value="unavailable">{t.unavailable}</option></select><ChevronDown size={16} /></label>
      <label className="date-field"><CalendarDays size={16} /><input type="date" value={filters.to} aria-label={t.toDate} onChange={event => updateFilter('to', event.target.value)} /></label>
      <label className="date-field"><CalendarDays size={16} /><input type="date" value={filters.from} aria-label={t.fromDate} onChange={event => updateFilter('from', event.target.value)} /></label>
      <label className="search-field"><input value={filters.search} placeholder={t.search} onChange={event => updateFilter('search', event.target.value)} /><Search size={17} /></label>
    </section>

    <section className="panel drivers"><div className="drivers-head"><h2>{t.driverManagement}</h2><p><span>{language === 'he' ? 'סה״כ 18 נהגים' : '18 drivers total'}</span><i /> <b>12 {t.available}</b><i /> <em>6 {t.unavailable}</em></p></div>
      <div className="table-scroll"><table><thead><tr>{t.headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{filteredDrivers.map(d => <tr key={d.id}>
        <td>{d.id}</td><td className="driver-name"><Avatar text={d.initials} color={d.color} /><b>{d.name}</b></td><td>032-458-762</td><td>{d.phone}</td><td><mark>{d.plate}</mark></td><td><b>{d.tows}</b></td><td><b>{d.revenue}</b></td>
        <td><span className={d.live ? 'status live' : 'status off'}>● {d.live ? t.available : t.unavailable}</span></td><td><button className="details">{t.details}</button><button className="lock">{t.lock}</button></td>
      </tr>)}</tbody></table></div>
      <div className="pagination"><span>{t.showing}</span><div><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button><ChevronLeft /></button></div></div>
    </section>

    <section className="lower-grid">
      <article className="panel recent"><div className="panel-head"><h2>{t.recentTows}</h2><button>{t.viewAll}</button></div>{t.recent.map((item, i) => <div className="activity" key={item[0]}>
        <span className={`activity-icon ${i === 2 ? 'danger' : i === 1 ? 'ice' : 'peach'}`}>{i === 2 ? <AlertTriangle /> : <img src="/assets/dashboard_icon/truck.png?v=2" alt="" />}</span><div><b>{item[0]}</b><small>{item[1]}</small></div><strong className={i === 2 ? 'cancelled' : ''}>{item[2]}</strong>
      </div>)}</article>
      <article className="panel top-drivers">
        <div className="panel-head"><h2>{t.topDrivers}</h2><Trophy className="trophy" /></div>
        <div className="leader-list">{[drivers[2], drivers[0], drivers[1]].map((d, i) => <div className="leader" key={d.id}><span className={`rank r${i + 1}`}>{i + 1}</span><Avatar text={d.initials} color={d.color} /><div><b>{d.name}</b><small>{d.tows} {t.towCount}</small></div><strong>{d.revenue}</strong></div>)}</div>
        <div className="leader-chart">
          <div className="chart-y-axis"><span>200</span><span>150</span><span>100</span><span>50</span><span>0</span></div>
          <div className="leader-plot">
            <i className="leader-grid g1" /><i className="leader-grid g2" /><i className="leader-grid g3" /><i className="leader-grid g4" /><i className="leader-grid g5" />
            <div className="leader-column"><span className="bar-orange" style={{ height: '88%' }} /><small>{language === 'he' ? 'דוד' : 'David'}</small></div>
            <div className="leader-column"><span className="bar-cyan" style={{ height: '58%' }} /><small>{language === 'he' ? 'יוסי' : 'Yossi'}</small></div>
            <div className="leader-column"><span className="bar-navy" style={{ height: '40%' }} /><small>{language === 'he' ? 'מוחמד' : 'Mohammed'}</small></div>
          </div>
        </div>
      </article>
    </section>
  </div>
}
