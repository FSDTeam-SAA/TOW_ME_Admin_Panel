import React, { useMemo, useState } from 'react'
import {
  AlertTriangle, ArrowUpRight, Filter, Mail, MapPin, Phone,
  Search, Send, Star,
} from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const CONVERSATIONS = [
  {
    id: 1,
    name: { he: 'דן כהן', en: 'Dan Cohen' },
    initial: 'ד',
    color: '#f26722',
    preview: { he: 'אני בחוץ כבר 20 דקות...', en: 'I have been outside for 20 minutes...' },
    time: { he: 'לפני 2 דק׳', en: '2 min ago' },
    unread: 2,
    tags: ['urgent', 'vip'],
    status: 'waiting',
    waiting: { he: 'מחכה 2 דקות', en: 'Waiting 2 minutes' },
    phone: '050-1234567',
    email: 'dan@email.com',
    memberSince: { he: 'חבר מאז מרץ 2023', en: 'Member since March 2023' },
    orderId: '#3421',
    orderStatus: 'enroute',
    from: { he: 'רחוב הרצל 45, תל אביב', en: '45 Herzl St, Tel Aviv' },
    to: { he: 'מוסך כרמי, רמת גן', en: 'Carmi Garage, Ramat Gan' },
    eta: { he: '8 דקות', en: '8 min' },
    driver: { he: 'יוסי לוי', en: 'Yossi Levi' },
    driverInitial: 'י',
    history: [
      { date: '15/03/2024', title: { he: 'גרירה הושלמה', en: 'Tow completed' }, ok: true },
      { date: '02/02/2024', title: { he: 'בעיה עם התשלום', en: 'Payment issue' }, ok: true },
      { date: '18/01/2024', title: { he: 'ביטול הזמנה', en: 'Order cancelled' }, ok: false },
    ],
    messages: [
      {
        id: 1,
        from: 'customer',
        text: {
          he: 'שלום, אני מחכה לגרירה כבר 20 דקות. הנהג עדיין לא הגיע. מה קורה?',
          en: 'Hi, I have been waiting for the tow for 20 minutes. The driver still has not arrived. What is going on?',
        },
        time: '14:28',
      },
      {
        id: 2,
        from: 'agent',
        text: {
          he: 'שלום דן, אני בודק עבורך את המיקום של הנהג כרגע. רגע אחד בבקשה...',
          en: 'Hello Dan, I am checking the driver location for you right now. One moment please...',
        },
        time: '14:29',
      },
      {
        id: 3,
        from: 'agent',
        text: {
          he: 'הנהג יוסי לוי בדרך אלייך. הוא נמצא במרחק של כ-8 דקות נסיעה. האם יש עוד משהו שאוכל לעזור?',
          en: 'Driver Yossi Levi is on the way to you. He is about 8 minutes away. Is there anything else I can help with?',
        },
        time: '14:30',
      },
    ],
  },
  {
    id: 2,
    name: { he: 'שרה לוי', en: 'Sara Levi' },
    initial: 'ש',
    color: '#1d96b5',
    preview: { he: 'תודה רבה על העזרה!', en: 'Thank you so much for the help!' },
    time: { he: 'לפני 15 דק׳', en: '15 min ago' },
    unread: 0,
    tags: ['vip'],
    status: 'active',
    waiting: { he: 'בטיפול', en: 'In progress' },
    phone: '052-9876543',
    email: 'sara@email.com',
    memberSince: { he: 'חברה מאז ינואר 2022', en: 'Member since January 2022' },
    orderId: '#3418',
    orderStatus: 'enroute',
    from: { he: 'דרך בגין 12, רמת גן', en: '12 Begin Rd, Ramat Gan' },
    to: { he: 'חניון אזור', en: 'Azor Parking' },
    eta: { he: '5 דקות', en: '5 min' },
    driver: { he: 'דוד ישראלי', en: 'David Israeli' },
    driverInitial: 'ד',
    history: [
      { date: '10/03/2024', title: { he: 'גרירה הושלמה', en: 'Tow completed' }, ok: true },
      { date: '22/12/2023', title: { he: 'פנייה כללית', en: 'General inquiry' }, ok: true },
    ],
    messages: [
      { id: 1, from: 'customer', text: { he: 'הגרירה הגיעה, תודה רבה!', en: 'The tow arrived, thank you!' }, time: '14:10' },
      { id: 2, from: 'agent', text: { he: 'בשמחה! האם הכל בסדר עכשיו?', en: 'Happy to help! Is everything okay now?' }, time: '14:12' },
      { id: 3, from: 'customer', text: { he: 'תודה רבה על העזרה!', en: 'Thank you so much for the help!' }, time: '14:15' },
    ],
  },
  {
    id: 3,
    name: { he: 'יוסי אברהם', en: 'Yossi Avraham' },
    initial: 'י',
    color: '#173c63',
    preview: { he: 'מתי הגרירה תגיע?', en: 'When will the tow arrive?' },
    time: { he: 'לפני 32 דק׳', en: '32 min ago' },
    unread: 1,
    tags: ['urgent'],
    status: 'waiting',
    waiting: { he: 'מחכה 32 דקות', en: 'Waiting 32 minutes' },
    phone: '054-5551212',
    email: 'yossi@email.com',
    memberSince: { he: 'חבר מאז אוגוסט 2021', en: 'Member since August 2021' },
    orderId: '#3415',
    orderStatus: 'waiting',
    from: { he: 'כביש 1 ק״מ 34', en: 'Highway 1, KM 34' },
    to: { he: 'מוסך הצפון', en: 'North Garage' },
    eta: { he: '15 דקות', en: '15 min' },
    driver: { he: 'מוחמד ג׳בר', en: 'Mohammed Jaber' },
    driverInitial: 'מ',
    history: [
      { date: '01/03/2024', title: { he: 'ביטול הזמנה', en: 'Order cancelled' }, ok: false },
      { date: '14/11/2023', title: { he: 'גרירה הושלמה', en: 'Tow completed' }, ok: true },
    ],
    messages: [
      { id: 1, from: 'customer', text: { he: 'מתי הגרירה תגיע?', en: 'When will the tow arrive?' }, time: '13:58' },
    ],
  },
  {
    id: 4,
    name: { he: 'מיכל דוד', en: 'Michal David' },
    initial: 'מ',
    color: '#0cb653',
    preview: { he: 'הכל בסדר, תודה', en: 'Everything is fine, thanks' },
    time: { he: 'לפני שעה', en: '1 hour ago' },
    unread: 0,
    tags: ['normal'],
    status: 'closed',
    waiting: { he: 'סגור', en: 'Closed' },
    phone: '053-4447788',
    email: 'michal@email.com',
    memberSince: { he: 'חברה מאז מאי 2023', en: 'Member since May 2023' },
    orderId: '#3409',
    orderStatus: 'done',
    from: { he: 'רחוב ויצמן 8, חולון', en: '8 Weizmann St, Holon' },
    to: { he: 'בית הלקוח', en: 'Customer home' },
    eta: { he: 'הושלם', en: 'Done' },
    driver: { he: 'יוסי לוי', en: 'Yossi Levi' },
    driverInitial: 'י',
    history: [{ date: '28/02/2024', title: { he: 'גרירה הושלמה', en: 'Tow completed' }, ok: true }],
    messages: [
      { id: 1, from: 'customer', text: { he: 'הכל בסדר, תודה', en: 'Everything is fine, thanks' }, time: '13:20' },
      { id: 2, from: 'agent', text: { he: 'שמחים לשמוע! יום נעים.', en: 'Glad to hear! Have a nice day.' }, time: '13:22' },
    ],
  },
  {
    id: 5,
    name: { he: 'אבי כהן', en: 'Avi Cohen' },
    initial: 'א',
    color: '#ef4b55',
    preview: { he: 'צריך עזרה דחופה', en: 'Need urgent help' },
    time: { he: 'אתמול', en: 'Yesterday' },
    unread: 0,
    tags: ['urgent'],
    status: 'closed',
    waiting: { he: 'סגור', en: 'Closed' },
    phone: '050-9998877',
    email: 'avi@email.com',
    memberSince: { he: 'חבר מאז דצמבר 2020', en: 'Member since December 2020' },
    orderId: '#3390',
    orderStatus: 'done',
    from: { he: 'שדרות רוטשילד 100, ת״א', en: '100 Rothschild Blvd, TA' },
    to: { he: 'מוסך המרכז', en: 'Central Garage' },
    eta: { he: 'הושלם', en: 'Done' },
    driver: { he: 'דוד ישראלי', en: 'David Israeli' },
    driverInitial: 'ד',
    history: [
      { date: '20/02/2024', title: { he: 'גרירה הושלמה', en: 'Tow completed' }, ok: true },
      { date: '05/01/2024', title: { he: 'בעיה עם התשלום', en: 'Payment issue' }, ok: false },
    ],
    messages: [
      { id: 1, from: 'customer', text: { he: 'צריך עזרה דחופה', en: 'Need urgent help' }, time: '09:10' },
    ],
  },
]

function Tag({ type, t }) {
  if (type === 'urgent') return <span className="cs-tag cs-tag--urgent">{t.urgent}</span>
  if (type === 'vip') return <span className="cs-tag cs-tag--vip">{t.vip}</span>
  return <span className="cs-tag cs-tag--normal">{t.normal}</span>
}

function OrderStatus({ status, t }) {
  const map = {
    enroute: ['cs-pill cs-pill--enroute', t.enRoute],
    waiting: ['cs-pill cs-pill--waiting', t.waitingStatus],
    done: ['cs-pill cs-pill--done', t.doneStatus],
  }
  const [cls, label] = map[status] || map.waiting
  return <span className={cls}>{label}</span>
}

export default function CustomerSupport() {
  const { t, language } = useLanguage()
  const lang = language === 'en' ? 'en' : 'he'
  const [tab, setTab] = useState('all')
  const [query, setQuery] = useState('')
  const [selectedId, setSelectedId] = useState(1)
  const [draft, setDraft] = useState('')

  const tabs = [
    { id: 'all', label: t.allRequests },
    { id: 'waiting', label: t.waitingTab },
    { id: 'active', label: t.inTreatment },
    { id: 'closed', label: t.closedTab },
  ]

  const filtered = useMemo(() => CONVERSATIONS.filter((c) => {
    const byTab = tab === 'all' || c.status === tab
    const q = query.trim().toLowerCase()
    const byQuery = !q
      || c.name[lang].toLowerCase().includes(q)
      || c.preview[lang].toLowerCase().includes(q)
      || c.orderId.toLowerCase().includes(q)
    return byTab && byQuery
  }), [tab, query, lang])

  const selected = CONVERSATIONS.find((c) => c.id === selectedId) || CONVERSATIONS[0]
  const sendMessage = () => { if (draft.trim()) setDraft('') }
  const quickReplies = [t.quickReply1, t.quickReply2, t.quickReply3]

  return (
    <div className="cs-page">
      <section className="cs-list-panel">
        <div className="cs-list-head">
          <div className="cs-list-title">
            <h2>{t.incomingRequests}</h2>
            <span className="cs-open-badge">{t.openCount}</span>
          </div>
          <button className="cs-icon-btn" type="button" aria-label={t.filter}>
            <Filter size={15} />
          </button>
        </div>

        <div className="cs-tabs" role="tablist">
          {tabs.map((item) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={tab === item.id}
              className={tab === item.id ? 'active' : ''}
              onClick={() => setTab(item.id)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <label className="cs-search">
          <Search size={14} />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchConversation}
          />
        </label>

        <div className="cs-conversations">
          {filtered.map((c) => (
            <button
              key={c.id}
              type="button"
              className={c.id === selected.id ? 'cs-conv active' : 'cs-conv'}
              onClick={() => setSelectedId(c.id)}
            >
              <Avatar text={c.initial} color={c.color} />
              <div className="cs-conv-body">
                <div className="cs-conv-top">
                  <b>{c.name[lang]}</b>
                  <span>{c.time[lang]}</span>
                </div>
                <p>{c.preview[lang]}</p>
                <div className="cs-conv-meta">
                  <div className="cs-conv-tags">
                    {c.tags.map((tag) => <Tag key={tag} type={tag} t={t} />)}
                  </div>
                  {c.unread > 0 && <em className="cs-unread">{c.unread}</em>}
                </div>
              </div>
            </button>
          ))}
        </div>
      </section>

      <section className="cs-chat-panel">
        <div className="cs-chat-head">
          <div className="cs-chat-user">
            <div>
              <b>{selected.name[lang]}</b>
              <span><i className="cs-dot" />{selected.waiting[lang]}</span>
            </div>
          </div>
          <div className="cs-chat-actions">
            <button type="button" className="cs-round cs-round--warn" aria-label={t.markUrgent}>
              <img src="/icons/warning.png" alt="" />
            </button>
            <button type="button" className="cs-round cs-round--ok" aria-label={t.doneStatus}>
              <img src="/icons/success.png" alt="" />
            </button>
            <button type="button" className="cs-round" aria-label={t.search}>
              <Search size={14} />
            </button>
          </div>
        </div>

        <div className="cs-status-bar">
          <span className="cs-ticket-id">{selected.orderId}</span>
          <span className="cs-status-chip cs-status-chip--wait">
            {t.waitTime}: {selected.eta[lang]}
          </span>
          <span className="cs-status-chip cs-status-chip--route">{t.enRoute}</span>
          <span className="cs-status-chip cs-status-chip--driver">{selected.driver[lang]}</span>
        </div>

        <div className="cs-messages">
          {selected.messages.map((m, index) => (
            <React.Fragment key={m.id}>
              {index === 2 && <div className="cs-time-sep">{m.time}</div>}
              <div className={m.from === 'agent' ? 'cs-msg cs-msg--agent' : 'cs-msg cs-msg--customer'}>
                {m.from === 'customer' && <Avatar text={selected.initial} color={selected.color} />}
                <div className="cs-bubble">
                  <p>{m.text[lang]}</p>
                </div>
                {m.from === 'agent' && <Avatar text="א" color="#1e3a5f" />}
              </div>
            </React.Fragment>
          ))}
          {selected.id === 1 && (
            <div className="cs-typing">
              <span /><span /><span />
              <em>{t.typing}</em>
            </div>
          )}
        </div>

        <div className="cs-composer">
          <div className="cs-quick">
            {quickReplies.map((reply) => (
              <button key={reply} type="button" onClick={() => setDraft(reply)}>{reply}</button>
            ))}
          </div>
          <div className="cs-input-row">
            <button type="button" className="cs-tool" aria-label="forward">
              <ArrowUpRight size={15} />
            </button>
            <button type="button" className="cs-tool" aria-label="star">
              <Star size={15} color="#ffc400" fill="#ffc400" />
            </button>
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={t.writeMessage}
            />
            <button type="button" className="cs-send" onClick={sendMessage} aria-label="send">
              <Send size={15} />
            </button>
          </div>
        </div>
      </section>

      <aside className="cs-details-panel">
        <div className="cs-profile">
          <div className="cs-profile-avatar">{selected.initial}</div>
          <h3>{selected.name[lang]}</h3>
          {selected.tags.includes('vip') && (
            <span className="cs-vip-badge">
              <Star size={10} fill="currentColor" />
              {t.vipClient}
            </span>
          )}
          <ul className="cs-contact">
            <li><Phone size={13} /><span>{selected.phone}</span></li>
            <li><Mail size={13} /><span>{selected.email}</span></li>
            <li><img src="/icons/calendar.png" alt="" /><span>{selected.memberSince[lang]}</span></li>
          </ul>
        </div>

        <div className="cs-order-card">
          <div className="cs-block-head">
            <h4>{t.currentOrder}</h4>
            <OrderStatus status={selected.orderStatus} t={t} />
          </div>
          <div className="cs-order-id">{selected.orderId}</div>
          <div className="cs-trip">
            <div className="cs-trip-row">
              <span className="cs-trip-dot cs-trip-dot--from" />
              <div>
                <small>{t.fromLabel}</small>
                <b>{selected.from[lang]}</b>
              </div>
            </div>
            <div className="cs-trip-line" />
            <div className="cs-trip-row">
              <MapPin size={14} className="cs-trip-pin" />
              <div>
                <small>{t.toLabel}</small>
                <b>{selected.to[lang]}</b>
              </div>
            </div>
          </div>
          <div className="cs-eta">
            <img src="/icons/truck.png" alt="" />
            <strong>{selected.eta[lang]}</strong>
          </div>
          <div className="cs-driver-card">
            <Avatar text={selected.driverInitial} color="#1d96b5" />
            <div>
              <small>{t.assignedDriver}</small>
              <b>{selected.driver[lang]}</b>
            </div>
          </div>
        </div>

        <div className="cs-side-block">
          <h4>{t.requestHistory}</h4>
          <ul className="cs-history">
            {selected.history.map((h) => (
              <li key={`${h.date}-${h.title.he}`}>
                <div>
                  <b>{h.title[lang]}</b>
                  <span>{h.date}</span>
                </div>
                {h.ok
                  ? <img src="/icons/success.png" alt="" />
                  : <img src="/icons/warning.png" alt="" />}
              </li>
            ))}
          </ul>
        </div>

        <div className="cs-side-block cs-side-block--actions">
          <h4>{t.quickActions}</h4>
          <div className="cs-actions">
            <button type="button" className="cs-action cs-action--sms">
              <img src="/icons/bell.png" alt="" />
              {t.sendSms}
            </button>
            <button type="button" className="cs-action cs-action--cancel">
              <AlertTriangle size={14} />
              {t.cancelOrder}
            </button>
            <button type="button" className="cs-action cs-action--transfer">
              <img src="/icons/truck.png" alt="" />
              {t.transferDriver}
            </button>
            <button type="button" className="cs-action cs-action--urgent">
              <Star size={14} fill="#ffc400" color="#f26722" />
              {t.markUrgent}
            </button>
          </div>
        </div>
      </aside>
    </div>
  )
}
