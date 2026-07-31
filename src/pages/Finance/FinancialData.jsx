import React from 'react'
import {
  CalendarDays, ChevronLeft, ChevronRight, Download, TrendingUp, Trophy,
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
  const revenuePoints = [[25,64],[140,45],[255,74],[370,56],[485,36],[600,70],[710,48]]
  const expensePoints = [[25,110],[140,96],[255,118],[370,101],[485,87],[600,115],[710,98]]
  return <div className="finance-line"><div className="finance-legend"><span><i className="income-line" />{t.income}</span><span><i className="expense-line" />{t.expenses}</span></div><div className="finance-y-axis"><span>₪30k</span><span>₪20k</span><span>₪10k</span><span>₪0</span></div><svg viewBox="0 0 720 210" preserveAspectRatio="none">
    {[35, 90, 145, 200].map(y => <line key={y} x1="25" y1={y} x2="710" y2={y} className="grid-line" />)}
    <path className="finance-area" d="M25 64 L140 45 L255 74 L370 56 L485 36 L600 70 L710 48 L710 200 L25 200Z" />
    <polyline className="orange-line" points="25,64 140,45 255,74 370,56 485,36 600,70 710,48" />
    <polyline className="blue-line" points="25,110 140,96 255,118 370,101 485,87 600,115 710,98" />
    {revenuePoints.map(([cx,cy]) => <circle key={`r-${cx}`} cx={cx} cy={cy} r="4.5" className="finance-point revenue-point" />)}
    {expensePoints.map(([cx,cy]) => <circle key={`e-${cx}`} cx={cx} cy={cy} r="4" className="finance-point expense-point" />)}
  </svg><div className="chart-labels">{t.weekdays.map(day => <span key={day}>{day}</span>)}</div></div>
}

function RevenueDonut({ t }) {
  return <div className="finance-donut-wrap"><div className="finance-donut">{t.towLegend.map((label, i) => <span key={label}><b>{label}</b><em>{[32,28,25,15][i]}%</em></span>)}</div><div className="legend">{t.towLegend.map((label, i) => <span key={label}><i className={['orange', 'navy', 'cyan', 'gray'][i]} />{label}</span>)}</div></div>
}

function DailyBars({ t }) {
  const days = [...t.weekdays].reverse()
  const bars = [
    ['navy', 62], ['cyan', 58], ['orange', 71], ['cyan', 65],
    ['orange', 78], ['navy', 59], ['cyan', 67],
  ]
  return <div className="daily-chart"><div className="daily-y-axis"><span>₪8000</span><span>₪6000</span><span>₪4000</span><span>₪2000</span><span>₪0</span></div><div className="daily-bars">
    <i className="daily-grid dg1" /><i className="daily-grid dg2" /><i className="daily-grid dg3" /><i className="daily-grid dg4" /><i className="daily-grid dg5" />
    {bars.map(([color, height], i) => <div className="daily-column" key={days[i]}><span className={`daily-${color}`} style={{ height: `${height}%` }} /><small>{days[i]}</small></div>)}
  </div></div>
}

export default function FinancialData() {
  const { t, language } = useLanguage()
  const money = amount => `₪${amount.toLocaleString()}`
  const transactionMoney = amount => amount.startsWith('+') ? `+₪${amount.slice(1)}` : `₪${amount}`
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
      <span className={`finance-metric-icon fm-${index}`}>{index < 4 ? <img src={`/assets/dashboard_icon/${['isrial_currency.png', 'truck.png', 'tikmark.png', 'star.png'][index]}?v=2`} alt="" /> : <Trophy />}</span>
      <strong>{metric[0]}</strong><p>{metric[1]}</p><small className={index === 1 ? 'metric-note-muted' : ''}>{metric[2]}{index !== 1 && <TrendingUp />}</small>
    </article>)}</section>

    <section className="finance-charts">
      <article className="panel finance-line-panel"><h2>{t.incomeExpenses}</h2><FinanceLineChart t={t} /></article>
      <article className="panel finance-donut-panel"><h2>{t.incomeByTow}</h2><RevenueDonut t={t} /></article>
    </section>

    <section className="panel commissions-table"><div className="commission-head"><h2>{t.commissions}</h2><p><b className="summary-paid">6 {t.paid}</b><i /> <b className="summary-pending">2 {t.pending}</b><i /> <span>8 {language === 'he' ? 'גרריסטים' : 'drivers'}</span></p></div><div className="table-scroll"><table>
      <thead><tr>{t.financeHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead><tbody>{people.map((person, i) => <tr key={person[3]}>
        <td>{i + 1}</td><td className="driver-name"><Avatar text={person[0]} color={person[1]} /><b>{language === 'he' ? person[2] : person[3]}</b></td><td><b>{person[4]}</b></td><td><b>{money(person[5])}</b></td>
        <td><span className={`commission-percent cp-${person[6]}`}>{person[6]}%</span></td><td><b>{money(person[7])}</b></td><td>{person[8]}</td><td><span className={person[9] ? 'payment-status paid' : 'payment-status pending'}>● {person[9] ? t.paid : t.pending}</span></td>
        <td><button className={person[9] ? 'payment-button sent' : 'payment-button'}>{t.sendPayment}</button></td>
      </tr>)}</tbody>
    </table></div><div className="driver-table-footer"><div className="driver-pagination"><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button><ChevronLeft /></button></div><span>{t.financeShowing}</span></div></section>

    <section className="finance-bottom">
      <article className="panel transactions"><div className="panel-head"><h2>{t.recentTransactions}</h2><button>{t.viewAll}</button></div><div className="transaction-head">{t.transactionHeaders.map(h => <b key={h}>{h}</b>)}</div>{transactions.map(row => <div className="transaction-row" key={row[0] + row[1]}><span>{row[0]}</span><b>{row[1]}</b><strong className={row[2] === '0' ? 'zero' : row[3] === 'processing' ? 'neutral' : ''}>{transactionMoney(row[2])}</strong><i className={row[3]}>{row[3] === 'completed' ? t.completed : row[3] === 'cancelled' ? t.cancelled : t.processing}</i></div>)}</article>
      <article className="panel average-income"><div className="panel-head"><h2>{t.dailyAverage}</h2><strong>{t.weekGrowth}<TrendingUp /></strong></div><DailyBars t={t} /></article>
    </section>
  </div>
}
