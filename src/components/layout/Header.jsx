import React from 'react'
import { LogOut, Menu, Radio } from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'
import { useAuth } from '../../auth/AuthContext'
import { useRealtime } from '../../realtime/RealtimeContext'
import { initialsOf } from '../../utils/format'

export default function Header({ page, openMenu }) {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const { connected } = useRealtime()

  const titles = {
    settings: [t.settings, t.settingsSubtitle],
    drivers: [t.driversPageTitle, t.driversPageSubtitle],
    finance: [t.financeTitle, t.financeSubtitle],
    history: [t.historyTitle, t.historySubtitle],
    support: [t.customerSupport, t.supportSubtitle],
    customers: [t.customerManagement, t.customersSubtitle],
  }
  const [title, subtitle] = titles[page] || [t.dashboard, t.welcome]

  return <header className="topbar">
    <div className="title"><h1>{title}</h1><p>{subtitle}</p></div>
    <div className="top-actions">
      <button className="menu-btn" onClick={openMenu}><Menu /></button>
      <span className={`live-pill ${connected ? 'on' : 'off'}`} title={user?.email}>
        <Radio size={14} />
        {connected ? t.liveConnected : t.liveDisconnected}
      </span>
      <Avatar text={initialsOf(user?.name || 'Admin')} color="#f16522" />
      <button className="bell" onClick={logout} title={t.logout}><LogOut size={18} /></button>
    </div>
  </header>
}
