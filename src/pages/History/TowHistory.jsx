import React from 'react'
import {
  AlertTriangle, CalendarDays, ChevronDown, ChevronLeft, ChevronRight,
  Download, Filter, Search, TrendingUp, Trophy,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const events = [
  ['14:32', '12/07/2025', 0, 'YL', '#758178', 'יוסי לוי', 'Yossi Levi', 'דן כהן', 'Dan Cohen', 'רחוב הרצל 12 ת״א → מוסך כרמי', '12 Herzl St → Carmi Garage', '8', '420', 'completed'],
  ['13:17', '12/07/2025', 1, 'MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', 'מירי לוי', 'Miri Levi', 'כיכר רבין → —', 'Rabin Square → —', '—', '—', 'cancelled'],
  ['12:55', '12/07/2025', 2, 'DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', 'רון אברהם', 'Ron Avraham', 'כביש 1 קמ 34 → חניון אלון', 'Highway 1 KM 34 → Alon Parking', '12', '680', 'onway'],
  ['11:42', '12/07/2025', 3, 'YL', '#758178', 'יוסי לוי', 'Yossi Levi', 'נועה מזרחי', 'Noa Mizrahi', 'רחוב דיזנגוף 88 → מוסך צפון', '88 Dizengoff St → North Garage', '5', '—', 'issue'],
  ['10:28', '12/07/2025', 4, 'MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', 'אבי פרץ', 'Avi Peretz', 'רחוב בן גוריון 3 → מוסך יפו', '3 Ben Gurion St → Jaffa Garage', '6', '350', 'new'],
  ['18:05', '11/07/2025', 0, 'DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', 'נועה ברק', 'Noa Barak', 'נמל ת״א → מוסך הדרום', 'Tel Aviv Port → South Garage', '15', '750', 'completed'],
  ['16:30', '11/07/2025', 1, 'YL', '#758178', 'יוסי לוי', 'Yossi Levi', 'גיל שפירא', 'Gil Shapira', 'רחוב ויצמן 5 → —', '5 Weizmann St → —', '—', '—', 'cancelled'],
  ['14:11', '11/07/2025', 0, 'DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', 'לאה גולן', 'Leah Golan', 'רחוב שינקין 20 → מוסך מרכז', '20 Shenkin St → Central Garage', '9', '480', 'completed'],
  ['09:50', '11/07/2025', 3, 'MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', 'יעל שלום', 'Yael Shalom', 'כביש 4 קמ 12 → רמלה', 'Highway 4 KM 12 → Ramla', '18', '—', 'issue'],
  ['08:22', '11/07/2025', 0, 'YL', '#758178', 'יוסי לוי', 'Yossi Levi', 'אורן דוד', 'Oren David', 'רחוב אלנבי 45 → מוסך יפו', '45 Allenby St → Jaffa Garage', '7', '390', 'completed'],
]

const activityItems = [
  [0, 'גרירה הושלמה', 'Tow completed', 'יוסי לוי · רחוב הרצל ← מוסך כרמי', 'Yossi Levi · Herzl St → Carmi Garage', '₪420', 'completed', 3],
  [1, 'ביטול הזמנה', 'Order cancelled', 'מוחמד ג׳בר · ביטול על ידי לקוח', 'Mohammed Jaber · cancelled by customer', 'בוטל', 'cancelled', 8],
  [2, 'גרירה בדרך', 'Tow en route', 'דוד ישראלי · כביש 1 ← חניון אלנבי', 'David Israeli · Highway 1 → Allenby Parking', 'בדרך', 'onway', 12],
  [3, 'תקלה בגרירה', 'Tow issue', 'יוסי לוי · דיזנגוף 88 ← מוסך צפון', 'Yossi Levi · 88 Dizengoff → North Garage', 'תקלה', 'issue', 21],
]

export default function TowHistory() {
  const { t, language } = useLanguage()
  const local = (he, en) => language === 'he' ? he : en
  const statusText = status => ({ completed: t.completed, cancelled: t.cancelled, onway: t.onWay, issue: t.issue, new: t.newStatus })[status]
  const metricNote = index => {
    if (index === 0) return <><b>+124</b><TrendingUp /><span>{language === 'he' ? 'החודש' : 'this month'}</span></>
    if (index === 1) return <><b>91.5%</b><span>{language === 'he' ? 'אחוז הצלחה' : 'success rate'}</span></>
    if (index === 2) return <><b>4.9%</b><span>{language === 'he' ? 'אחוז ביטול' : 'cancellation rate'}</span></>
    return <><b>{language === 'he' ? 'דקות' : 'Minutes'}</b><span>{language === 'he' ? 'ממוצע לגרירה' : 'average per tow'}</span></>
  }

  return <div className="content history-page">
    <div className="history-layout">
      <aside className="panel activity-timeline"><div className="activity-title"><h2>{t.recentActivity}</h2><span>● {t.realtime}</span></div>{activityItems.map((item) => {
        const timelineIcon = item[0] === 0 ? <img src="/assets/dashboard_icon/tikmark.png?v=2" alt="" /> : item[0] === 1 ? <AlertTriangle /> : item[0] === 2 ? <img src="/assets/dashboard_icon/truck.png?v=2" alt="" /> : <Trophy />
        const badge = language === 'he' ? item[5] : ({ completed: '₪420', cancelled: 'Cancelled', onway: 'En Route', issue: 'Issue' })[item[6]]
        return <div className="timeline-item" key={item[1]}><span className={`timeline-icon ti-${item[0]}`}>{timelineIcon}</span><div><b>{local(item[1], item[2])}</b><small>{local(item[3], item[4])}</small><strong className={`timeline-badge ${item[6]}`}>{badge}</strong></div><em>{language === 'he' ? `לפני ${item[7]} דק׳` : `${item[7]}m ago`}</em></div>
      })}</aside>

      <div className="history-main">
        <section className="history-metrics">{t.historyMetrics.map((metric, i) => <article className="panel" key={metric[1]}><span className={`history-metric-icon hm-${i}`}>{i === 0 ? <img src="/assets/dashboard_icon/truck.png?v=2" alt="" /> : i === 1 ? <img src="/assets/dashboard_icon/tikmark.png?v=2" alt="" /> : i === 2 ? <AlertTriangle /> : <img src="/assets/dashboard_icon/star.png?v=2" alt="" />}</span><strong>{metric[0]}</strong><p>{metric[1]}</p><small>{metricNote(i)}</small></article>)}</section>
        <section className="panel history-filters"><button className="outline"><Download />{t.excelExport}</button><button className="history-search-btn"><Filter />{t.filter}</button><label>{t.customerSearch}<Search /></label><label>{t.towSearch}<Search /></label><label>{t.allStatuses}<ChevronDown /></label><label><CalendarDays />{t.toDate}</label><label><CalendarDays />{t.fromDate}</label></section>
        <section className="panel history-tabs"><button className="active">{t.allActivities}</button><button>{t.towsTab}</button><button>{t.cancellationsTab}</button><button>{t.issuesTab}</button></section>
        <section className="panel history-table"><div className="history-table-head"><h2>{t.activityLog}</h2><p><b className="history-cancelled">189 {t.cancelled}</b><i /><b className="history-completed">3,521 {t.completed}</b><i /><span>{language === 'he' ? 'סה״כ 3,847 גרירות' : '3,847 total tows'}</span></p></div><div className="table-scroll"><table><thead><tr>{t.historyHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{events.map((e, i) => {
          const eventIcon = e[2] === 0 || e[2] === 2 ? <img src="/assets/dashboard_icon/truck.png?v=2" alt="" /> : e[2] === 1 ? <AlertTriangle /> : e[2] === 3 ? <Trophy /> : <img src="/assets/dashboard_icon/star.png?v=2" alt="" />
          return <tr key={e[0] + e[1]}><td>{i + 1}</td><td><b>{e[0]}</b><small>{e[1]}</small></td><td><span className={`event-type et-${e[2]}`}>{eventIcon}{t.actionTypes[e[2]]}</span></td><td className="driver-name"><Avatar text={e[3]} color={e[4]} /><b>{local(e[5], e[6])}</b></td><td>{local(e[7], e[8])}</td><td className="route-cell">{local(e[9], e[10])}</td><td>{e[11]} {e[11] !== '—' && (language === 'he' ? 'ק״מ' : 'km')}</td><td className="event-price">{e[12] === '—' ? '—' : `₪${e[12]}`}</td><td><span className={`event-status ${e[13]}`}>● {statusText(e[13])}</span></td><td><button className="event-details"><ChevronLeft /></button></td></tr>
        })}</tbody></table></div><div className="driver-table-footer"><div className="driver-pagination"><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button><ChevronLeft /></button></div><span>{t.historyShowing}</span></div></section>
      </div>
    </div>
  </div>
}
