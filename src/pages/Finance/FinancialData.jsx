import React from 'react'
import {
  CalendarDays, Check, ChevronLeft, ChevronRight, Download, Star, Trophy, Truck,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const people = [
  ['YL', '#758178', 'יוסי לוי', 'Yossi Levi', 42, 18900, 15, 2835, '28/06/2025', true],
  ['MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', 31, 13950, 15, 2093, '—', false],
  ['DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', 67, 30150, 18, 5427, '29/06/2025', true],
  ['AB', '#f16522', 'אריאל בן-דוד', 'Ariel Ben-David', 29, 12980, 15, 1948, '27/06/2025', true],
  ['RA', '#416f7b', 'רמי אלחדד', 'Rami Alhadad', 40, 18000, 18, 3240, '—', false],
  ['NS', '#28241e', 'נדב שמואלי', 'Nadav Shmueli', 19, 8750, 15, 1313, '26/06/2025', true],
  ['SH', '#6a6c4f', 'סמי חסן', 'Sami Hassan', 50, 22500, 18, 4050, '25/06/2025', true],
  ['EM', '#707a73', 'אלי מזרחי', 'Eli Mizrahi', 26, 12000, 15, 1800, '24/06/2025', true],
]

function FinanceLineChart({ t }) {
  return <div className="finance-line"><div className="finance-legend"><span><i className="income-line" />{t.income}</span><span><i className="expense-line" />{t.expenses}</span></div><svg viewBox="0 0 720 210" preserveAspectRatio="none">
    {[35, 90, 145, 200].map(y => <line key={y} x1="25" y1={y} x2="710" y2={y} className="grid-line" />)}
    <path className="finance-area" d="M25 64 L140 45 L255 74 L370 56 L485 36 L600 70 L710 48 L710 200 L25 200Z" />
    <polyline className="orange-line" points="25,64 140,45 255,74 370,56 485,36 600,70 710,48" />
    <polyline className="blue-line" points="25,110 140,96 255,118 370,101 485,87 600,115 710,98" />
  </svg><div className="chart-labels">{t.weekdays.map(day => <span key={day}>{day}</span>)}</div></div>
}

function RevenueDonut({ t }) {
  return <div className="finance-donut-wrap"><div className="finance-donut"><span>32%</span><span>28%</span><span>25%</span><span>15%</span></div><div className="legend">{t.towLegend.map((label, i) => <span key={label}><i className={['orange', 'navy', 'cyan', 'gray'][i]} />{label}</span>)}</div></div>
}

function DailyBars({ t }) {
  const heights = [62, 55, 71, 65, 79, 58, 67]
  return <div className="daily-bars">{heights.map((height, i) => <div key={t.weekdays[i]}><span style={{ height }} /><small>{t.weekdays[i]}</small></div>)}</div>
}

export default function FinancialData() {
  const { t, language } = useLanguage()
  const money = amount => `${language === 'he' ? '₪' : '$'}${amount.toLocaleString()}`
  const transactions = [
    ['30/06/2025', language === 'he' ? 'גרירה - הרצל 45 ת״א' : 'Tow — 45 Herzl St', '+420', 'completed'],
    ['30/06/2025', language === 'he' ? 'גרירה כביש 1 ← אלנבי' : 'Tow Highway 1 → Allenby', '+680', 'completed'],
    ['29/06/2025', language === 'he' ? 'תקלה בגרירה - בוטלה' : 'Tow issue — cancelled', '0', 'cancelled'],
    ['29/06/2025', language === 'he' ? 'גרירה - נמל תל אביב' : 'Tow — Tel Aviv Port', '+350', 'completed'],
    ['28/06/2025', language === 'he' ? 'עמלת גרריסט - דוד ישראלי' : 'Driver commission — David Israeli', '540', 'processing'],
    ['28/06/2025', language === 'he' ? 'גרירה - כביש 4' : 'Tow — Highway 4', '+890', 'completed'],
  ]

  return <div className="content finance-page">
    <div className="finance-page-tools"><button><Download />{t.exportReport}</button><label><CalendarDays />01/06/2025&nbsp;&nbsp;–&nbsp;&nbsp;30/06/2025</label></div>
    <section className="finance-metrics">{t.financeMetrics.map((metric, index) => <article className="panel" key={metric[1]}>
      <span className={`finance-metric-icon fm-${index}`}>{index === 0 ? '$' : index === 1 ? <Truck /> : index === 2 ? <Check /> : index === 3 ? <Star /> : <Trophy />}</span>
      <strong>{metric[0]}</strong><p>{metric[1]}</p><small>{metric[2]}</small>
    </article>)}</section>

    <section className="finance-charts">
      <article className="panel finance-line-panel"><h2>{t.incomeExpenses}</h2><FinanceLineChart t={t} /></article>
      <article className="panel finance-donut-panel"><h2>{t.incomeByTow}</h2><RevenueDonut t={t} /></article>
    </section>

    <section className="panel commissions-table"><div className="commission-head"><h2>{t.commissions}</h2><p>{t.commissionSummary}</p></div><div className="table-scroll"><table>
      <thead><tr>{t.financeHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{people.map((person, i) => <tr key={person[3]}>
        <td>{i + 1}</td><td className="driver-name"><Avatar text={person[0]} color={person[1]} /><b>{language === 'he' ? person[2] : person[3]}</b></td><td><b>{person[4]}</b></td><td><b>{money(person[5])}</b></td>
        <td><span className={`commission-percent cp-${person[6]}`}>{person[6]}%</span></td><td><b>{money(person[7])}</b></td><td>{person[8]}</td><td><span className={person[9] ? 'payment-status paid' : 'payment-status pending'}>● {person[9] ? t.paid : t.pending}</span></td>
        <td><button className={person[9] ? 'payment-button sent' : 'payment-button'}>{person[9] ? t.paid : t.sendPayment}</button></td>
      </tr>)}</tbody>
    </table></div><div className="driver-table-footer"><div className="driver-pagination"><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button><ChevronLeft /></button></div><span>{t.financeShowing}</span></div></section>

    <section className="finance-bottom">
      <article className="panel transactions"><div className="panel-head"><h2>{t.recentTransactions}</h2><button>{t.viewAll}</button></div><div className="transaction-head">{t.transactionHeaders.map(h => <b key={h}>{h}</b>)}</div>{transactions.map(row => <div className="transaction-row" key={row[0] + row[1]}><span>{row[0]}</span><b>{row[1]}</b><strong className={row[2] === '0' ? 'zero' : ''}>{language === 'he' ? '₪' : '$'}{row[2]}</strong><i className={row[3]}>{row[3] === 'completed' ? t.completed : row[3] === 'cancelled' ? t.cancelled : t.processing}</i></div>)}</article>
      <article className="panel average-income"><div className="panel-head"><h2>{t.dailyAverage}</h2><strong>{t.weekGrowth}</strong></div><DailyBars t={t} /></article>
    </section>
  </div>
}
