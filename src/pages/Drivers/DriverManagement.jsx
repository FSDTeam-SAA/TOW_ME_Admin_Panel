import React, { useMemo, useState } from 'react'
import {
  CalendarDays, ChevronDown, ChevronLeft, ChevronRight, Download,
  Filter, Search, X,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const initialRows = [
  ['YL', '#748174', 'יוסי לוי', 'Yossi Levi', '032-458-762', '050-123-4567', '12-345-67', 0, 142, 5, 'available'],
  ['MJ', '#29231f', 'מוחמד ג׳בר', 'Mohammed Jaber', '045-678-123', '052-987-6543', '98-765-43', 1, 98, 4, 'unavailable'],
  ['DI', '#6a6c4f', 'דוד ישראלי', 'David Israeli', '078-234-901', '054-321-7890', '55-444-11', 0, 217, 5, 'towing'],
  ['AB', '#f16522', 'אריאל בן-דוד', 'Ariel Ben-David', '056-789-234', '053-456-7891', '77-213-88', 2, 83, 4, 'available'],
  ['RA', '#416f7b', 'רמי אסחד', 'Rami Asad', '034-567-890', '058-112-3344', '33-901-55', 1, 176, 5, 'unavailable'],
  ['NS', '#28241e', 'נדב שמואלי', 'Nadav Shmueli', '023-456-789', '055-678-9012', '44-102-76', 0, 59, 4, 'towing'],
  ['SH', '#6a6c4f', 'סמי חסן', 'Sami Hassan', '089-123-456', '057-334-5566', '22-678-99', 2, 134, 5, 'available'],
  ['EM', '#707a73', 'אלי מזרחי', 'Eli Mizrahi', '067-890-123', '052-889-0011', '88-532-14', 1, 47, 4, 'unavailable'],
]

const metricIcons = ['truck.png', 'tikmark.png', 'isrial_currency.png', 'star.png']

export default function DriverManagement() {
  const { t, language } = useLanguage()
  const [rows, setRows] = useState(initialRows)
  const [search, setSearch] = useState('')
  const [status, setStatus] = useState('all')
  const [vehicle, setVehicle] = useState('all')
  const [page, setPage] = useState(1)
  const [addOpen, setAddOpen] = useState(false)
  const [newDriver, setNewDriver] = useState({ name: '', id: '', phone: '', plate: '' })
  const statusLabel = status => status === 'available' ? t.available : status === 'towing' ? t.towingNow : t.unavailable
  const filteredRows = useMemo(() => rows.filter(row => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [row[2], row[3], row[4], row[5], row[6]].some(value => String(value).toLowerCase().includes(query))
    const matchesStatus = status === 'all' || row[10] === status
    const matchesVehicle = vehicle === 'all' || String(row[7]) === vehicle
    return matchesSearch && matchesStatus && matchesVehicle
  }), [rows, search, status, vehicle])

  const exportRows = () => {
    const data = [t.driverPageHeaders.slice(0, 9), ...filteredRows.map((row, index) => [index + 1, language === 'he' ? row[2] : row[3], row[4], row[5], row[6], t.vehicleTypes[row[7]], row[8], row[9], statusLabel(row[10])])]
    const csv = data.map(row => row.map(value => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([`\uFEFF${csv}`], { type: 'text/csv;charset=utf-8' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'tow-me-drivers.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  const addDriver = event => {
    event.preventDefault()
    if (!newDriver.name || !newDriver.phone || !newDriver.plate) return
    const next = ['ND', '#258ca8', newDriver.name, newDriver.name, newDriver.id || '000-000-000', newDriver.phone, newDriver.plate, 0, 0, 5, 'available']
    setRows(current => [...current, next])
    setNewDriver({ name: '', id: '', phone: '', plate: '' })
    setAddOpen(false)
  }

  return <div className="content drivers-page">
    <section className="driver-metrics">
      {t.driverMetrics.map((metric, index) => <article className="panel" key={metric[1]}>
        <span className={`driver-metric-icon dm-${index}`}><img src={`/assets/dashboard_icon/${metricIcons[index]}?v=2`} alt="" /></span>
        <strong>{metric[0]}</strong><p>{metric[1]}</p><small className={index === 0 || index === 3 ? 'positive' : ''}>{metric[2]}</small>
      </article>)}
    </section>

    <section className="panel driver-toolbar">
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <button className="add-driver" onClick={() => setAddOpen(true)}><Filter size={17} />{t.addDriver}</button>
      <label><select value={status} onChange={event => { setStatus(event.target.value); setPage(1) }}><option value="all">{t.allStatuses}</option><option value="available">{t.available}</option><option value="unavailable">{t.unavailable}</option><option value="towing">{t.towingNow}</option></select><ChevronDown size={16} /></label>
      <label><select value={vehicle} onChange={event => { setVehicle(event.target.value); setPage(1) }}><option value="all">{t.vehicleType}</option>{t.vehicleTypes.map((type, index) => <option value={index} key={type}>{type}</option>)}</select><CalendarDays size={16} /></label>
      <label className="driver-search"><input value={search} onChange={event => { setSearch(event.target.value); setPage(1) }} placeholder={t.driverSearch} /><Search size={18} /></label>
    </section>

    <section className="panel full-drivers-table">
      <div className="full-drivers-head"><h2>{t.driversTableTitle}</h2><p>{t.driversCount}</p></div>
      <div className="table-scroll"><table>
        <thead><tr>{t.driverPageHeaders.map(h => <th key={h}>{h}</th>)}</tr></thead>
        <tbody>{filteredRows.map((row, index) => <tr key={row[6]}>
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
      <div className="driver-table-footer"><div className="driver-pagination"><button onClick={() => setPage(value => Math.max(1, value - 1))}><ChevronRight /></button>{[1, 2, 3, 4].map(value => <button key={value} className={page === value ? 'current' : ''} onClick={() => setPage(value)}>{value}</button>)}<button onClick={() => setPage(value => Math.min(4, value + 1))}><ChevronLeft /></button></div><span>{t.driverPageShowing}</span></div>
    </section>
    {addOpen && <div className="driver-modal-backdrop" onMouseDown={() => setAddOpen(false)}><form className="driver-modal" onSubmit={addDriver} onMouseDown={event => event.stopPropagation()}>
      <div className="driver-modal-head"><h2>{t.addDriver}</h2><button type="button" onClick={() => setAddOpen(false)}><X /></button></div>
      <label><span>{language === 'he' ? 'שם מלא' : 'Full Name'}</span><input value={newDriver.name} onChange={event => setNewDriver(current => ({ ...current, name: event.target.value }))} required /></label>
      <label><span>{language === 'he' ? 'תעודת זהות' : 'ID Number'}</span><input value={newDriver.id} onChange={event => setNewDriver(current => ({ ...current, id: event.target.value }))} /></label>
      <label><span>{t.phone}</span><input value={newDriver.phone} onChange={event => setNewDriver(current => ({ ...current, phone: event.target.value }))} required /></label>
      <label><span>{language === 'he' ? 'לוחית רישוי' : 'License Plate'}</span><input value={newDriver.plate} onChange={event => setNewDriver(current => ({ ...current, plate: event.target.value }))} required /></label>
      <button className="driver-modal-submit" type="submit">{t.addDriver}</button>
    </form></div>}
  </div>
}
