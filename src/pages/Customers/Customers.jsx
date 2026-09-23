import React, { useCallback, useMemo, useState } from 'react'
import { Crown, Download, Lock, Search } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import {
  avatarColor, downloadCsv, formatDate, formatIls, initialsOf,
} from '../../utils/format'

const TABS = ['all', 'active', 'vip', 'blocked']

export default function Customers() {
  const { t } = useLanguage()
  const [search, setSearch] = useState('')
  const [tab, setTab] = useState('all')
  const [actionError, setActionError] = useState('')
  const [busy, setBusy] = useState('')

  const fetcher = useCallback(() => api.customers({ limit: 200 }), [])
  const { data, error, loading, reload } = useApiResource(fetcher)

  const customers = useMemo(() => data?.customers || [], [data])
  const stats = data?.stats

  const filtered = useMemo(() => customers.filter((customer) => {
    const query = search.trim().toLowerCase()
    const matchesSearch = !query || [
      customer.name, customer.phoneNumber, customer.email, customer.city,
    ].some((value) => String(value || '').toLowerCase().includes(query))

    const matchesTab =
      tab === 'all' ||
      (tab === 'vip' && customer.isVip) ||
      (tab === 'blocked' && customer.isBlocked) ||
      (tab === 'active' && !customer.isBlocked)

    return matchesSearch && matchesTab
  }), [customers, search, tab])

  const runAction = async (id, action) => {
    setBusy(id)
    setActionError('')
    try {
      await action()
      await reload()
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy('')
    }
  }

  const exportRows = () => downloadCsv('tow-me-customers.csv', [
    ['#', 'Name', 'Phone', 'Email', 'City', 'Joined', 'Trips', 'Total paid', 'Status'],
    ...filtered.map((customer, index) => [
      index + 1,
      customer.name,
      customer.phoneNumber,
      customer.email,
      customer.city,
      formatDate(customer.createdAt),
      customer.totalTrips ?? 0,
      customer.totalSpent ?? 0,
      customer.isBlocked ? 'blocked' : customer.isVip ? 'VIP' : 'active',
    ]),
  ])

  const tabLabel = (key) => ({
    all: t.cmAllStatuses,
    active: t.cmActive,
    vip: 'VIP',
    blocked: t.cmBlocked,
  })[key]

  if (loading || error) {
    return <div className="content drivers-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content drivers-page">
    {stats && <section className="driver-metrics">
      {[
        [stats.total, t.cmAllStatuses],
        [stats.active, t.cmActive],
        [stats.vip, 'VIP'],
        [stats.newThisMonth, t.cmNewThisMonth || t.cmActive],
      ].map(([value, label]) => <article className="panel" key={label}>
        <strong>{value ?? 0}</strong><p>{label}</p>
      </article>)}
    </section>}

    <section className="panel driver-toolbar">
      <button className="outline" onClick={exportRows}><Download size={17} />{t.export}</button>
      <div className="cm-status-tabs">
        {TABS.map((key) => (
          <button
            key={key}
            className={tab === key ? 'active' : ''}
            onClick={() => setTab(key)}
          >{tabLabel(key)}</button>
        ))}
      </div>
      <label className="driver-search">
        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder={t.search}
        />
        <Search size={18} />
      </label>
    </section>

    {actionError && <div className="login-error">{actionError}</div>}

    <section className="panel full-drivers-table">
      <div className="full-drivers-head">
        <h2>{t.customerManagement}</h2>
        <p>{filtered.length}</p>
      </div>
      <div className="table-scroll"><table>
        <thead><tr>
          <th>#</th><th>{t.cmHeaders[1]}</th><th>{t.cmHeaders[2]}</th><th>{t.cmHeaders[3]}</th>
          <th>{t.cmHeaders[5]}</th><th>{t.cmHeaders[6]}</th><th>{t.cmHeaders[7]}</th>
          <th>{t.cmHeaders[9]}</th><th>{t.cmHeaders[10]}</th>
        </tr></thead>
        <tbody>
          {filtered.length === 0
            ? <tr><td colSpan={9} className="empty-row">{t.noResults}</td></tr>
            : filtered.map((customer, index) => <tr key={customer._id}>
                <td>{index + 1}</td>
                <td className="driver-name">
                  <Avatar text={initialsOf(customer.name)} color={avatarColor(customer._id)} />
                  <b>{customer.name || '—'}</b>
                  {customer.isVip && <Crown size={14} className="vip-icon" />}
                </td>
                <td>{customer.phoneNumber}</td>
                <td>{customer.email || '—'}</td>
                <td>{formatDate(customer.createdAt)}</td>
                <td><b>{customer.totalTrips ?? 0}</b></td>
                <td><b>{formatIls(customer.totalSpent)}</b></td>
                <td>
                  <span className={`driver-status ${customer.isBlocked ? 'unavailable' : 'available'}`}>
                    ● {customer.isBlocked ? t.cmBlocked : t.cmActive}
                  </span>
                </td>
                <td className="row-actions">
                  <button
                    className="details"
                    disabled={busy === customer._id}
                    onClick={() => runAction(customer._id, () => api.toggleCustomerVip(customer._id))}
                  ><Crown size={14} />VIP</button>
                  <button
                    className="lock"
                    disabled={busy === customer._id}
                    onClick={() => runAction(customer._id, () => api.toggleCustomerBlock(customer._id))}
                  ><Lock size={14} />{customer.isBlocked ? t.cmActive : t.cmBlock}</button>
                </td>
              </tr>)}
        </tbody>
      </table></div>
    </section>
  </div>
}
