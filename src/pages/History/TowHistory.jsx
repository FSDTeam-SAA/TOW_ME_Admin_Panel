import React from 'react'
import {
  AlertTriangle, CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight,
  Download, Filter, Search, Star, Trophy, Truck,
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
  [0, 'גרירה הושלמה', 'Tow completed', 'יוסי לוי · רחוב הרצל', 'Yossi Levi · Herzl St', '420'],
  [1, 'ביטול הזמנה', 'Order cancelled', 'מוחמד ג׳בר · בוטל ע״י לקוח', 'Mohammed Jaber · customer cancelled', ''],
  [2, 'גרירה בדרך', 'Tow en route', 'דוד ישראלי · כביש 1', 'David Israeli · Highway 1', ''],
  [3, 'תקלה בגרירה', 'Tow issue', 'יוסי לוי · מוסך צפון', 'Yossi Levi · North Garage', ''],
]

const typeIcons = [Truck, AlertTriangle, Truck, Trophy, Star]

export default function TowHistory() {
  const { t, language } = useLanguage()
  const local = (he, en) => language === 'he' ? he : en
  const statusText = status => ({ completed: t.completed, cancelled: t.cancelled, onway: t.onWay, issue: t.issue, new: t.newStatus })[status]

  return <div className="content history-page">
    <div className="history-layout">
      <aside className="panel activity-timeline"><div className="activity-title"><h2>{t.recentActivity}</h2><span>● {t.realtime}</span></div>{activityItems.map((item, i) => {
        const Icon = typeIcons[item[0]]
        return <div className="timeline-item" key={item[1]}><span className={`timeline-icon ti-${item[0]}`}><Icon /></span><div><b>{local(item[1], item[2])}</b><small>{local(item[3], item[4])}</small>{item[5] && <strong>{language === 'he' ? '₪' : '$'}{item[5]}</strong>}</div><em>{i * 4 + 3}m</em></div>
      })}</aside>

      <div className="history-main">
        <section className="history-metrics">{t.historyMetrics.map((metric, i) => <article className="panel" key={metric[1]}><span className={`history-metric-icon hm-${i}`}>{i === 0 ? <Truck /> : i === 1 ? <Check /> : i === 2 ? <AlertTriangle /> : <Star />}</span><strong>{metric[0]}</strong><p>{metric[1]}</p><small>{metric[2]}</small></article>)}</section>
        <section className="panel history-filters"><button className="outline"><Download />{t.excelExport}</button><button className="history-search-btn"><Filter />{t.filter}</button><label>{t.customerSearch}<Search /></label><label>{t.towSearch}<Search /></label><label>{t.allStatuses}<ChevronDown /></label><label><CalendarDays />{t.fromDate}</label><label><CalendarDays />{t.toDate}</label></section>
        <section className="panel history-tabs"><button className="active">{t.allActivities}</button><button>{t.towsTab}</button><button>{t.cancellationsTab}</button><button>{t.issuesTab}</button></section>
        <section className="panel history-table"><div className="history-table-head"><h2>{t.activityLog}</h2><p>{t.historySummary}</p></div><div className="table-scroll"><table><thead><tr>{t.historyHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{events.map((e, i) => {
          const Icon = typeIcons[e[2]]
          return <tr key={e[0] + e[1]}><td>{i + 1}</td><td><b>{e[0]}</b><small>{e[1]}</small></td><td><span className={`event-type et-${e[2]}`}><Icon />{t.actionTypes[e[2]]}</span></td><td className="driver-name"><Avatar text={e[3]} color={e[4]} /><b>{local(e[5], e[6])}</b></td><td>{local(e[7], e[8])}</td><td className="route-cell">{local(e[9], e[10])}</td><td>{e[11]} {e[11] !== '—' && 'km'}</td><td className="event-price">{e[12] === '—' ? '—' : `${language === 'he' ? '₪' : '$'}${e[12]}`}</td><td><span className={`event-status ${e[13]}`}>● {statusText(e[13])}</span></td><td><button className="event-details"><ChevronLeft /></button></td></tr>
        })}</tbody></table></div><div className="driver-table-footer"><div className="driver-pagination"><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button>5</button><button><ChevronLeft /></button></div><span>{t.historyShowing}</span></div></section>
      </div>
    </div>
  </div>
}
