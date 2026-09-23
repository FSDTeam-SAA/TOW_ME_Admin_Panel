import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Crown, Search, Send } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import PageState from '../../components/common/PageState'
import { useLanguage } from '../../i18n/LanguageContext'
import { api } from '../../api/client'
import useApiResource from '../../hooks/useApiResource'
import { avatarColor, formatDateTime, initialsOf } from '../../utils/format'

const STATUSES = ['all', 'open', 'in_progress', 'resolved', 'closed']

const statusText = (status, t) => ({
  open: t.supOpen || 'Open',
  in_progress: t.supInProgress || 'In progress',
  resolved: t.supResolved || 'Resolved',
  closed: t.supClosed || 'Closed',
  all: t.cmAllStatuses,
}[status] || status)

export default function CustomerSupport() {
  const { t } = useLanguage()
  const [status, setStatus] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState(null)
  const [reply, setReply] = useState('')
  const [busy, setBusy] = useState(false)
  const [actionError, setActionError] = useState('')

  const listFetcher = useCallback(
    () => api.tickets({ limit: 100, status: status === 'all' ? undefined : status }),
    [status],
  )
  const { data, error, loading, reload } = useApiResource(listFetcher)

  const tickets = useMemo(() => data?.tickets || [], [data])
  const stats = data?.stats

  const filtered = useMemo(() => tickets.filter((ticket) => {
    const query = search.trim().toLowerCase()
    if (!query) return true
    return [ticket.subject, ticket.ticketNumber, ticket.customerId?.name]
      .some((value) => String(value || '').toLowerCase().includes(query))
  }), [tickets, search])

  // Keep a valid selection as the list changes.
  useEffect(() => {
    if (filtered.length === 0) {
      setSelectedId(null)
    } else if (!filtered.some((ticket) => ticket._id === selectedId)) {
      setSelectedId(filtered[0]._id)
    }
  }, [filtered, selectedId])

  const detailFetcher = useCallback(
    () => (selectedId ? api.ticket(selectedId) : Promise.resolve({ data: null })),
    [selectedId],
  )
  const { data: ticket, reload: reloadTicket } = useApiResource(detailFetcher)

  const threadRef = useRef(null)
  useEffect(() => {
    if (threadRef.current) threadRef.current.scrollTop = threadRef.current.scrollHeight
  }, [ticket])

  const sendReply = async (event) => {
    event.preventDefault()
    if (!reply.trim() || !selectedId) return
    setBusy(true)
    setActionError('')
    try {
      await api.replyToTicket(selectedId, reply.trim())
      setReply('')
      await Promise.all([reloadTicket(), reload()])
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  const changeStatus = async (nextStatus) => {
    if (!selectedId) return
    setBusy(true)
    setActionError('')
    try {
      await api.setTicketStatus(selectedId, nextStatus)
      await Promise.all([reloadTicket(), reload()])
    } catch (err) {
      setActionError(err.message)
    } finally {
      setBusy(false)
    }
  }

  if (loading || error) {
    return <div className="content drivers-page">
      <PageState loading={loading} error={error} onRetry={reload} t={t} />
    </div>
  }

  return <div className="content drivers-page support-page">
    {stats && <section className="driver-metrics">
      {[
        [stats.total, t.cmAllStatuses],
        [stats.open, statusText('open', t)],
        [stats.inProgress, statusText('in_progress', t)],
        [stats.resolved, statusText('resolved', t)],
      ].map(([value, label]) => <article className="panel" key={label}>
        <strong>{value ?? 0}</strong><p>{label}</p>
      </article>)}
    </section>}

    <section className="panel driver-toolbar">
      <div className="cm-status-tabs">
        {STATUSES.map((key) => (
          <button key={key} className={status === key ? 'active' : ''} onClick={() => setStatus(key)}>
            {statusText(key, t)}
          </button>
        ))}
      </div>
      <label className="driver-search">
        <input value={search} placeholder={t.search}
          onChange={(event) => setSearch(event.target.value)} />
        <Search size={18} />
      </label>
    </section>

    {actionError && <div className="login-error">{actionError}</div>}

    <section className="support-grid">
      <article className="panel ticket-list">
        {filtered.length === 0
          ? <p className="empty-row">{t.noResults}</p>
          : filtered.map((item) => (
              <button
                key={item._id}
                className={`ticket-row ${item._id === selectedId ? 'active' : ''}`}
                onClick={() => setSelectedId(item._id)}
              >
                <Avatar
                  text={initialsOf(item.customerId?.name)}
                  color={avatarColor(item._id)}
                />
                <div>
                  <b>
                    {item.customerId?.name || '—'}
                    {item.isVipCustomer && <Crown size={12} className="vip-icon" />}
                  </b>
                  <small>{item.subject}</small>
                  <em>#{item.ticketNumber} · {formatDateTime(item.updatedAt || item.createdAt)}</em>
                </div>
                <span className={`ticket-status s-${item.status}`}>
                  {statusText(item.status, t)}
                </span>
              </button>
            ))}
      </article>

      <article className="panel ticket-thread">
        {!ticket
          ? <p className="empty-row">{t.noResults}</p>
          : <>
              <div className="thread-head">
                <div>
                  <b>{ticket.customerId?.name || '—'}</b>
                  <small>#{ticket.ticketNumber} · {ticket.subject}</small>
                </div>
                <select
                  value={ticket.status}
                  disabled={busy}
                  onChange={(event) => changeStatus(event.target.value)}
                >
                  {STATUSES.filter((s) => s !== 'all').map((s) => (
                    <option value={s} key={s}>{statusText(s, t)}</option>
                  ))}
                </select>
              </div>

              <div className="thread-messages" ref={threadRef}>
                {(ticket.messages || []).length === 0
                  ? <p className="empty-row">{t.noResults}</p>
                  : ticket.messages.map((message, index) => (
                      <div
                        key={message._id || index}
                        className={`bubble ${message.sender === 'admin' ? 'mine' : 'theirs'}`}
                      >
                        <p>{message.content}</p>
                        <small>{formatDateTime(message.createdAt)}</small>
                      </div>
                    ))}
              </div>

              <form className="thread-reply" onSubmit={sendReply}>
                <input
                  value={reply}
                  onChange={(event) => setReply(event.target.value)}
                  placeholder={t.supReplyPlaceholder || '...'}
                  disabled={busy}
                />
                <button type="submit" disabled={busy || !reply.trim()}>
                  <Send size={17} />
                </button>
              </form>
            </>}
      </article>
    </section>
  </div>
}
