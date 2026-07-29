import React, { useMemo, useState } from 'react'
import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Download, Search, Trophy,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const dashboardIcons = ['truck.png', 'isrial_currency.png', 'tikmark.png', 'star.png']
const metricTones = ['peach', 'silver', 'mint', 'ice']

function MetricIcon({ index }) {
  return <div className={`metric-icon ${metricTones[index]}`}>
    <img
      src={`/assets/dashboard_icon/${dashboardIcons[index]}?v=2`}
      alt=""
    />
  </div>
}

const CUSTOMERS = [
  { id: 1, he: 'דן כהן', en: 'Dan Cohen', initial: 'ד', color: '#f26722', phone: '050-1234567', email: 'dan@email.com', cityHe: 'תל אביב', cityEn: 'Tel Aviv', joined: '12/03/2023', orders: 18, paidHe: '₪7,420', paidEn: '$7,420', last: '28/03/2024', status: 'active' },
  { id: 2, he: 'שרה לוי', en: 'Sara Levi', initial: 'ש', color: '#1d96b5', phone: '052-9876543', email: 'sara@email.com', cityHe: 'ירושלים', cityEn: 'Jerusalem', joined: '05/01/2022', orders: 31, paidHe: '₪12,800', paidEn: '$12,800', last: '27/03/2024', status: 'active' },
  { id: 3, he: 'יוסי אברהם', en: 'Yossi Avraham', initial: 'י', color: '#173c63', phone: '054-5551212', email: 'yossi@email.com', cityHe: 'חיפה', cityEn: 'Haifa', joined: '18/08/2021', orders: 9, paidHe: '₪3,150', paidEn: '$3,150', last: '10/02/2024', status: 'inactive' },
  { id: 4, he: 'מיכל דוד', en: 'Michal David', initial: 'מ', color: '#0cb653', phone: '053-4447788', email: 'michal@email.com', cityHe: 'תל אביב', cityEn: 'Tel Aviv', joined: '22/05/2023', orders: 12, paidHe: '₪4,960', paidEn: '$4,960', last: '25/03/2024', status: 'active' },
  { id: 5, he: 'אבי כהן', en: 'Avi Cohen', initial: 'א', color: '#ef4b55', phone: '050-9998877', email: 'avi@email.com', cityHe: 'רמת גן', cityEn: 'Ramat Gan', joined: '03/12/2020', orders: 23, paidHe: '₪9,740', paidEn: '$9,740', last: '01/03/2024', status: 'blocked' },
  { id: 6, he: 'נועה ישראלי', en: 'Noa Israeli', initial: 'נ', color: '#8e6cc9', phone: '058-1122334', email: 'noa@email.com', cityHe: 'חיפה', cityEn: 'Haifa', joined: '14/07/2022', orders: 7, paidHe: '₪2,180', paidEn: '$2,180', last: '19/03/2024', status: 'active' },
  { id: 7, he: 'רועי מזרחי', en: 'Roi Mizrahi', initial: 'ר', color: '#e8a317', phone: '052-6677889', email: 'roi@email.com', cityHe: 'ירושלים', cityEn: 'Jerusalem', joined: '09/09/2021', orders: 15, paidHe: '₪6,030', paidEn: '$6,030', last: '15/03/2024', status: 'inactive' },
  { id: 8, he: 'תמר גולד', en: 'Tamar Gold', initial: 'ת', color: '#2a9d8f', phone: '054-2233445', email: 'tamar@email.com', cityHe: 'תל אביב', cityEn: 'Tel Aviv', joined: '30/11/2023', orders: 4, paidHe: '₪1,260', paidEn: '$1,260', last: '26/03/2024', status: 'active' },
]

const TOP = [
  { he: 'תמר פרץ', en: 'Tamar Peretz', initial: 'ת', color: '#f26722', orders: 31, width: '100%' },
  { he: 'מאיה לוי', en: 'Maya Levy', initial: 'מ', color: '#1d96b5', orders: 23, width: '74%' },
  { he: 'רחל גולד', en: 'Rachel Gold', initial: 'ר', color: '#173c63', orders: 17, width: '55%' },
  { he: 'דן כהן', en: 'Dan Cohen', initial: 'ד', color: '#8a95b2', orders: 12, width: '39%' },
  { he: 'נועה מזרחי', en: 'Noa Mizrahi', initial: 'נ', color: '#c4c4c4', orders: 8, width: '26%' },
]

const CITIES = [
  { he: 'ירושלים', en: 'Jerusalem', pct: 22, color: '#173c63' },
  { he: 'אחר', en: 'Other', pct: 25, color: '#b9b9b9' },
  { he: 'תל אביב', en: 'Tel Aviv', pct: 35, color: '#f26722' },
  { he: 'חיפה', en: 'Haifa', pct: 18, color: '#1d96b5' },
]

const CITY_COUNTS = [
  { he: 'תל אביב', en: 'Tel Aviv', count: 449, color: '#f26722' },
  { he: 'ירושלים', en: 'Jerusalem', count: 282, color: '#173c63' },
  { he: 'חיפה', en: 'Haifa', count: 231, color: '#1d96b5' },
]

function StatusPill({ status, t }) {
  if (status === 'active') return <span className="cm-status cm-status--active">● {t.cmActive}</span>
  if (status === 'blocked') return <span className="cm-status cm-status--blocked">● {t.cmBlocked}</span>
  return <span className="cm-status cm-status--inactive">● {t.cmInactive}</span>
}

export default function Customers() {
  const { t, language } = useLanguage()
  const lang = language === 'en' ? 'en' : 'he'
  const [query, setQuery] = useState('')
  const [city, setCity] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')

  const rows = useMemo(() => CUSTOMERS.filter((c) => {
    const q = query.trim().toLowerCase()
    const byQuery = !q
      || c[lang].toLowerCase().includes(q)
      || c.phone.includes(q)
      || c.email.toLowerCase().includes(q)
      || (lang === 'he' ? c.cityHe : c.cityEn).toLowerCase().includes(q)
    const byCity = city === 'all' || (lang === 'he' ? c.cityHe : c.cityEn) === city
    const byStatus = statusFilter === 'all' || c.status === statusFilter
    return byQuery && byCity && byStatus
  }), [query, city, statusFilter, lang])

  const metrics = [
    { value: '1,284', label: t.cmTotal, foot: t.cmTotalTrend, up: true },
    { value: '892', label: t.cmActiveCount, foot: t.cmActiveFoot, up: false },
    { value: '67', label: t.cmNewMonth, foot: t.cmNewTrend, up: true },
    { value: '3.2', label: t.cmAvgOrders, foot: '★★★★☆', stars: true },
  ]

  return (
    <div className="content cm-page">
      <section className="stats">
        {metrics.map((m, i) => (
          <article key={m.label}>
            <MetricIcon index={i} />
            <strong>{m.value}</strong>
            <p>{m.label}</p>
            {m.stars
              ? <div className="stars">{m.foot}</div>
              : <small className={m.up ? 'up' : ''}>{m.foot}</small>}
          </article>
        ))}
      </section>

      <section className="filters panel cm-filters">
        <button type="button" className="outline"><Download size={16} />{t.export}</button>
        <label className="cm-select">
          <select value={city} onChange={(e) => setCity(e.target.value)} aria-label={t.cmCity}>
            <option value="all">{t.cmAllCities}</option>
            <option value={lang === 'he' ? 'תל אביב' : 'Tel Aviv'}>{lang === 'he' ? 'תל אביב' : 'Tel Aviv'}</option>
            <option value={lang === 'he' ? 'ירושלים' : 'Jerusalem'}>{lang === 'he' ? 'ירושלים' : 'Jerusalem'}</option>
            <option value={lang === 'he' ? 'חיפה' : 'Haifa'}>{lang === 'he' ? 'חיפה' : 'Haifa'}</option>
            <option value={lang === 'he' ? 'רמת גן' : 'Ramat Gan'}>{lang === 'he' ? 'רמת גן' : 'Ramat Gan'}</option>
          </select>
          <ChevronDown size={15} />
        </label>
        <label className="cm-select">
          <select defaultValue="orders" aria-label={t.cmSort}>
            <option value="orders">{t.cmSortOrders}</option>
            <option value="name">{t.cmSortName}</option>
            <option value="joined">{t.cmSortJoined}</option>
          </select>
          <ChevronDown size={15} />
        </label>
        <label><CalendarDays size={15} />{t.toDate}</label>
        <label><CalendarDays size={15} />{t.fromDate}</label>
        <label className="search-field">
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.cmSearch}
          />
          <Search size={16} />
        </label>
      </section>

      <section className="panel drivers cm-table-panel">
        <div className="drivers-head cm-table-head">
          <h2>{t.customerManagement}</h2>
          <p>
            <b className="cm-sum-active">892 {t.cmActive}</b>
            <i />
            <em className="cm-sum-inactive">380 {t.cmInactive}</em>
            <i />
            <em className="cm-sum-blocked">12 {t.cmBlocked}</em>
          </p>
        </div>

        <div className="cm-status-tabs">
          {[
            ['all', t.cmAllStatuses],
            ['active', t.cmActive],
            ['inactive', t.cmInactive],
            ['blocked', t.cmBlocked],
          ].map(([id, label]) => (
            <button
              key={id}
              type="button"
              className={statusFilter === id ? 'active' : ''}
              onClick={() => setStatusFilter(id)}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="table-scroll">
          <table className="cm-table">
            <thead>
              <tr>
                {t.cmHeaders.map((h) => <th key={h}>{h}</th>)}
              </tr>
            </thead>
            <tbody>
              {rows.map((c) => (
                <tr key={c.id}>
                  <td>{c.id}</td>
                  <td>
                    <div className="driver-name">
                      <Avatar text={c.initial} color={c.color} />
                      <b>{c[lang]}</b>
                    </div>
                  </td>
                  <td>{c.phone}</td>
                  <td>{c.email}</td>
                  <td>{lang === 'he' ? c.cityHe : c.cityEn}</td>
                  <td>{c.joined}</td>
                  <td><b>{c.orders}</b></td>
                  <td><b>{lang === 'he' ? c.paidHe : c.paidEn}</b></td>
                  <td>{c.last}</td>
                  <td><StatusPill status={c.status} t={t} /></td>
                  <td>
                    <button type="button" className="details">{t.cmView}</button>
                    <button type="button" className="lock">{t.cmBlock}</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="pagination">
          <span>{t.cmShowing}</span>
          <div>
            <button type="button"><ChevronRight /></button>
            <button type="button" className="current">1</button>
            <button type="button">2</button>
            <button type="button">3</button>
            <button type="button"><ChevronLeft /></button>
          </div>
        </div>
      </section>

      <section className="lower-grid cm-lower">
        <article className="panel cm-top-panel">
          <div className="panel-head">
            <h2>{t.cmTopCustomers}</h2>
            <Trophy className="trophy" />
          </div>
          <div className="cm-top-list">
            {TOP.map((c, i) => (
              <div key={c.en} className="cm-top-row">
                <span className={`rank r${Math.min(i + 1, 5)}`}>{i + 1}</span>
                <Avatar text={c.initial} color={c.color} />
                <div className="cm-top-info">
                  <b>{lang === 'he' ? c.he : c.en}</b>
                  <div className="cm-bar-track">
                    <i style={{ width: c.width, background: c.color }} />
                  </div>
                </div>
                <strong>{c.orders} {t.cmOrders}</strong>
              </div>
            ))}
          </div>
          <div className="cm-chart">
            <div className="cm-y-axis">
              <span>30</span>
              <span>20</span>
              <span>10</span>
              <span>0</span>
            </div>
            <div className="cm-vbars">
              {TOP.map((c) => (
                <div key={`bar-${c.en}`} className="cm-vbar">
                  <span>{c.orders}</span>
                  <i style={{ height: `${(c.orders / 30) * 100}%`, background: c.color }} />
                  <small>{lang === 'he' ? c.he : c.en}</small>
                </div>
              ))}
            </div>
          </div>
        </article>

        <article className="panel cm-city-panel">
          <div className="panel-head"><h2>{t.cmCitySeg}</h2></div>
          <div className="cm-donut-wrap">
            <div className="cm-donut">
              <span className="cm-d35">35%</span>
              <span className="cm-d25">25%</span>
              <span className="cm-d22">22%</span>
              <span className="cm-d18">18%</span>
            </div>
            <div className="cm-legend">
              {CITIES.map((c) => (
                <span key={c.en}>
                  <i style={{ background: c.color }} />
                  {lang === 'he' ? c.he : c.en} {c.pct}%
                </span>
              ))}
            </div>
          </div>
          <div className="cm-city-list">
            {CITY_COUNTS.map((c) => (
              <div key={c.en} className="cm-city-row">
                <span className="cm-city-dot" style={{ background: c.color }} />
                <b>{lang === 'he' ? c.he : c.en}</b>
                <strong>{c.count}</strong>
              </div>
            ))}
          </div>
        </article>
      </section>
    </div>
  )
}
