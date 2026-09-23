import React, { useCallback, useMemo, useState } from 'react'
import { ChevronDown, Download } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import { useRealtimeEvent } from '../../realtime/RealtimeContext'
import {
  avatarColor, downloadCsv, formatDateTime, formatIls, initialsOf,
} from '../../utils/format'

const LIVE_EVENTS = ['trip:updated']
const PERIODS = ['week', 'month', 'year']

export default function FinancialData() {
  const { t } = useLanguage()
  const [period, setPeriod] = useState('month')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState('')

  const fetcher = useCallback(() => api.financials({ period }), [period])
  const { data, error, loading, reload } = useApiResource(fetcher)
  useRealtimeEvent(LIVE_EVENTS, reload)

  const summary = data?.summary
  const commissions = useMemo(() => data?.driverCommissions || [], [data])
  const transactions = useMemo(() => data?.recentTransactions || [], [data])

  const markPaid = async (driverId, status) => {
    setBusy(driverId)
    setActionError('')
    try {
      await api.setDriverPayment(driverId, status)
      await reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy('')
    }
  }

  const exportRows = () => downloadCsv('tow-me-financials.csv', [
    ['Driver', 'Phone', 'Trips', 'Revenue', 'Commission', 'Driver earnings', 'Last payment'],
    ...commissions.map((row) => [
      `${row.firstName || ''} ${row.lastName || ''}`.trim(),
      row.phoneNumber,
      row.totalTrips,
      row.totalRevenue,
      row.totalCommission,
      row.driverEarnings,
      formatDateTime(row.lastPayment),
    ]),
  ])

  const periodLabel = (key) => ({
    week: t.thisWeek,
    month: t.lastMonth,
    year: t.financeTitle,
  })[key] || key

  if (loading || error) {
    return <div className="content drivers-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content drivers-page">
    <section className="driver-metrics">
      {[
        [formatIls(summary?.totalRevenue), t.financeTitle],
        [formatIls(summary?.totalCommission), t.headers[6]],
        [formatIls(summary?.totalDriverEarnings), t.topDrivers],
        [summary?.totalTransactions ?? 0, t.cmOrders],
      ].map(([value, label]) => <article className="panel" key={label}>
        <strong>{value}</strong><p>{label}</p>
      </article>)}
    </section>

    <section className="panel driver-toolbar">
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <label>
        <select value={period} onChange={(event) => setPeriod(event.target.value)}>
          {PERIODS.map((key) => <option value={key} key={key}>{periodLabel(key)}</option>)}
        </select>
        <ChevronDown size={16} />
      </label>
    </section>

    {actionError && <div className="login-error">{actionError}</div>}

    <section className="panel full-drivers-table">
      <div className="full-drivers-head">
        <h2>{t.topDrivers}</h2>
        <p>{commissions.length}</p>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>
          <th>#</th><th>{t.headers[1]}</th><th>{t.phone}</th><th>{t.headers[5]}</th>
          <th>{t.financeTitle}</th><th>{t.headers[6]}</th><th>%</th><th>{t.headers[8]}</th>
        </tr></thead>
        <tbody>
          {commissions.length === 0
            ? <tr><td colSpan={8} className="empty-row">{t.noResults}</td></tr>
            : commissions.map((row, index) => {
                const name = `${row.firstName || ''} ${row.lastName || ''}`.trim()
                return <tr key={row.driverId}>
                  <td>{index + 1}</td>
                  <td className="driver-name">
                    <Avatar text={initialsOf(name)} color={avatarColor(row.driverId)} />
                    <b>{name || '—'}</b>
                  </td>
                  <td>{row.phoneNumber}</td>
                  <td><b>{row.totalTrips}</b></td>
                  <td><b>{formatIls(row.totalRevenue)}</b></td>
                  <td><b>{formatIls(row.totalCommission)}</b></td>
                  <td>{row.commissionPercent ?? 15}%</td>
                  <td className="row-actions">
                    <button
                      className="approve"
                      disabled={busy === row.driverId}
                      onClick={() => markPaid(row.driverId, 'paid')}
                    >{t.confirm}</button>
                  </td>
                </tr>
              })}
        </tbody>
      </table></div>
    </section>

    <section className="panel full-drivers-table">
      <div className="full-drivers-head">
        <h2>{t.recentTows}</h2>
        <p>{transactions.length}</p>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>
          <th>#</th><th>{t.nav[3]}</th><th>{t.cmHeaders[1]}</th><th>{t.headers[1]}</th>
          <th>{t.headers[6]}</th><th>{t.headers[7]}</th><th>{t.cmHeaders[5]}</th>
        </tr></thead>
        <tbody>
          {transactions.length === 0
            ? <tr><td colSpan={7} className="empty-row">{t.noResults}</td></tr>
            : transactions.map((tx, index) => <tr key={tx._id}>
                <td>{index + 1}</td>
                <td><mark>{tx.tripId?.tripNumber ? `#${tx.tripId.tripNumber}` : tx.transactionId}</mark></td>
                <td>{tx.customerId?.name || '—'}</td>
                <td>{`${tx.driverId?.firstName || ''} ${tx.driverId?.lastName || ''}`.trim() || '—'}</td>
                <td><b>{formatIls(tx.amount)}</b></td>
                <td><span className={`driver-status ${tx.status === 'completed' ? 'available' : 'unavailable'}`}>
                  ● {tx.type}
                </span></td>
                <td>{formatDateTime(tx.createdAt)}</td>
              </tr>)}
        </tbody>
      </table></div>
    </section>
  </div>
}
