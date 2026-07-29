import React from 'react'
import {
  AlertTriangle, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  Download, Filter, Search, Star, Trophy, Truck,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const baseDrivers = [
  { id: 1, he: 'יוסי לוי', en: 'Yossi Levi', initials: 'YL', color: '#758178', phone: '050-123-4567', plate: '12–345–67', tows: 142, heRevenue: '₪38,540', enRevenue: '$38,540', live: true },
  { id: 2, he: 'מוחמד ג׳בר', en: 'Mohammed Jaber', initials: 'MJ', color: '#29231f', phone: '052-987-6543', plate: '98–765–43', tows: 98, heRevenue: '₪24,100', enRevenue: '$24,100', live: false },
  { id: 3, he: 'דוד ישראלי', en: 'David Israeli', initials: 'DI', color: '#6a6c4f', phone: '054-321-7890', plate: '55–444–11', tows: 217, heRevenue: '₪62,800', enRevenue: '$62,800', live: true },
]

function LineChart({ labels }) {
  return <div className="line-chart"><svg viewBox="0 0 720 190" preserveAspectRatio="none">
    {[30, 80, 130, 180].map(y => <line key={y} x1="30" y1={y} x2="710" y2={y} className="grid-line" />)}
    <path d="M30 108 L140 73 L250 92 L360 45 L470 61 L580 30 L710 64 L710 180 L30 180Z" className="area" />
    <polyline points="30,108 140,73 250,92 360,45 470,61 580,30 710,64" className="orange-line" />
    <polyline points="30,124 140,95 250,102 360,76 470,86 580,58 710,88" className="blue-line" />
  </svg><div className="chart-labels">{labels.map(label => <span key={label}>{label}</span>)}</div></div>
}

function Donut({ labels }) {
  return <div className="pie-wrap"><div className="pie"><span className="p32">32%</span><span className="p28">28%</span><span className="p25">25%</span><span className="p15">15%</span></div>
    <div className="legend">{labels.map((label, i) => <span key={label}><i className={['orange', 'navy', 'cyan', 'gray'][i]} />{label}</span>)}</div></div>
}

export default function Dashboard() {
  const { t, language } = useLanguage()
  const drivers = baseDrivers.map(d => ({ ...d, name: d[language], revenue: d[`${language}Revenue`] }))
  return <div className="content">
    <section className="stats">{t.metrics.map((metric, i) => <article key={metric[1]}>
      <div className={`metric-icon ${['peach', 'silver', 'mint', 'ice'][i]}`}>{i === 0 ? <Truck /> : i === 1 ? '$' : i === 2 ? <Check /> : <Star />}</div>
      <strong>{metric[0]}</strong><p>{metric[1]}</p>{i === 3 ? <div className="stars">{metric[2]}</div> : <small className={i < 2 ? 'up' : ''}>{metric[2]}</small>}
    </article>)}</section>

    <section className="charts">
      <article className="panel revenue-panel"><div className="panel-head"><h2>{t.weeklyRevenue}</h2><div className="tabs"><button className="selected">{t.thisWeek}</button><button>{t.lastMonth}</button></div></div><LineChart labels={t.weekdays} /></article>
      <article className="panel pie-panel"><h2>{t.towTypes}</h2><Donut labels={t.towLegend} /></article>
    </section>

    <section className="filters panel">
      <button className="outline"><Download size={17} />{t.export}</button><button className="filter-btn"><Filter size={16} />{t.filter}</button>
      <label>{t.allStatuses}<ChevronDown size={16} /></label><label><CalendarDays size={16} />{t.toDate}</label><label><CalendarDays size={16} />{t.fromDate}</label>
      <label className="search-field"><span>{t.search}</span><Search size={17} /></label>
    </section>

    <section className="panel drivers"><div className="drivers-head"><h2>{t.driverManagement}</h2><p>{t.driverSummary}</p></div>
      <div className="table-scroll"><table><thead><tr>{t.headers.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{drivers.map(d => <tr key={d.id}>
        <td>{d.id}</td><td className="driver-name"><Avatar text={d.initials} color={d.color} /><b>{d.name}</b></td><td>032-458-762</td><td>{d.phone}</td><td><mark>{d.plate}</mark></td><td><b>{d.tows}</b></td><td><b>{d.revenue}</b></td>
        <td><span className={d.live ? 'status live' : 'status off'}>● {d.live ? t.available : t.unavailable}</span></td><td><button className="details">{t.details}</button><button className="lock">{t.lock}</button></td>
      </tr>)}</tbody></table></div>
      <div className="pagination"><span>{t.showing}</span><div><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button><ChevronLeft /></button></div></div>
    </section>

    <section className="lower-grid">
      <article className="panel recent"><div className="panel-head"><h2>{t.recentTows}</h2><button>{t.viewAll}</button></div>{t.recent.map((item, i) => <div className="activity" key={item[0]}>
        <span className={`activity-icon ${i === 2 ? 'danger' : i === 1 ? 'ice' : 'peach'}`}>{i === 2 ? <AlertTriangle /> : <Truck />}</span><div><b>{item[0]}</b><small>{item[1]}</small></div><strong className={i === 2 ? 'cancelled' : ''}>{item[2]}</strong>
      </div>)}</article>
      <article className="panel top-drivers"><div className="panel-head"><h2>{t.topDrivers}</h2><Trophy className="trophy" /></div>{drivers.slice().reverse().map((d, i) => <div className="leader" key={d.id}><span className={`rank r${i + 1}`}>{i + 1}</span><Avatar text={d.initials} color={d.color} /><div><b>{d.name}</b><small>{d.tows} {t.towCount}</small></div><strong>{d.revenue}</strong></div>)}<div className="bars"><span style={{ height: 68 }} /><span style={{ height: 47 }} /><span style={{ height: 33 }} /></div></article>
    </section>
  </div>
}
