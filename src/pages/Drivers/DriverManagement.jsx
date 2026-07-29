import React from 'react'
import {
  CalendarDays, Check, ChevronDown, ChevronLeft, ChevronRight, Download,
  Filter, Search, Star, Truck,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const rows = [
  ['YL', '#748174', 'יוסי לוי', 'Yossi Levi', '032-458-762', '050-123-4567', '12-345-67', 0, 142, 5, 'available'],
  ['MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', '045-678-123', '052-987-6543', '98-765-43', 1, 98, 4, 'unavailable'],
  ['DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', '078-234-901', '054-321-7890', '55-444-11', 0, 217, 5, 'towing'],
  ['AB', '#f16522', 'אריאל בן-דוד', 'Ariel Ben-David', '056-789-234', '053-456-7891', '77-213-88', 2, 83, 4, 'available'],
  ['RA', '#416f7b', 'רמי אסחד', 'Rami Asad', '034-567-890', '058-112-3344', '33-901-55', 1, 176, 5, 'unavailable'],
  ['NS', '#28241e', 'נדב שמואלי', 'Nadav Shmueli', '023-456-789', '055-678-9012', '44-102-76', 0, 59, 4, 'towing'],
  ['SH', '#6a6c4f', 'סמי חסן', 'Sami Hassan', '089-123-456', '057-334-5566', '22-678-99', 2, 134, 5, 'available'],
  ['EM', '#707a73', 'אלי מזרחי', 'Eli Mizrahi', '067-890-123', '052-889-0011', '88-532-14', 1, 47, 4, 'unavailable'],
]

export default function DriverManagement() {
  const { t, language } = useLanguage()
  const statusLabel = status => status === 'available' ? t.available : status === 'towing' ? t.towingNow : t.unavailable

  return <div className="content drivers-page">
    <section className="driver-metrics">
      {t.driverMetrics.map((metric, index) => <article className="panel" key={metric[1]}>
        <span className={`driver-metric-icon dm-${index}`}>{index === 0 ? <Truck /> : index === 1 ? <Check /> : index === 2 ? '$' : <Star />}</span>
        <strong>{metric[0]}</strong><p>{metric[1]}</p><small className={index === 0 || index === 3 ? 'positive' : ''}>{metric[2]}</small>
      </article>)}
    </section>

    <section className="panel driver-toolbar">
      <button className="outline"><Download size={17} />{t.export}</button>
      <button className="add-driver"><Filter size={17} />{t.addDriver}</button>
      <label>{t.allStatuses}<ChevronDown size={16} /></label>
      <label>{t.vehicleType}<CalendarDays size={16} /></label>
      <label className="driver-search"><span>{t.driverSearch}</span><Search size={18} /></label>
    </section>

    <section className="panel full-drivers-table">
      <div className="full-drivers-head"><h2>{t.driversTableTitle}</h2><p>{t.driversCount}</p></div>
      <div className="table-scroll"><table>
        <thead><tr>{t.driverPageHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{rows.map((row, index) => <tr key={row[6]}>
          <td>{index + 1}</td>
          <td className="driver-name"><Avatar text={row[0]} color={row[1]} /><b>{language === 'he' ? row[2] : row[3]}</b></td>
          <td>{row[4]}</td><td>{row[5]}</td><td><mark>{row[6]}</mark></td>
          <td><span className={`vehicle-badge vehicle-${row[7]}`}>{t.vehicleTypes[row[7]]}</span></td>
          <td><b>{row[8]}</b></td>
          <td><span className="rating">{'★'.repeat(row[9])}<i>{'★'.repeat(5 - row[9])}</i></span></td>
          <td><span className={`driver-status ${row[10]}`}>● {statusLabel(row[10])}</span></td>
          <td><button className="details">{t.details}</button><button className="lock">{t.lock}</button></td>
        </tr>)}</tbody>
      </table></div>
      <div className="driver-table-footer"><div className="driver-pagination"><button><ChevronRight /></button><button className="current">1</button><button>2</button><button>3</button><button>4</button><button><ChevronLeft /></button></div><span>{t.driverPageShowing}</span></div>
    </section>
  </div>
}
