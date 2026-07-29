import React from 'react'
import {
  CircleDollarSign, ClipboardList, Headset, LayoutDashboard, LogOut,
  Settings, Truck, Users, X,
} from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

const icons = [LayoutDashboard, Truck, CircleDollarSign, ClipboardList, Users, Settings, Headset]

export default function Sidebar({ page, setPage, open, setOpen }) {
  const { t } = useLanguage()
  const openPage = (index) => {
    if (index === 0) setPage('dashboard')
    if (index === 1) setPage('drivers')
    if (index === 2) setPage('finance')
    if (index === 3) setPage('history')
    if (index === 4) setPage('customers')
    if (index === 5) setPage('settings')
    if (index === 6) setPage('support')
    setOpen(false)
  }

  return <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
    <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close"><X /></button>
    <div className="logo"><span className="logo-pin">⌁</span><b>TOW ME</b><small>{t.panel}</small></div>
    <div className="side-profile"><Avatar text="AC" color="#f16522" large /><div><b>{t.adminName}</b><span>{t.adminRole}</span></div></div>
    <nav>{t.nav.map((label, index) => {
      const Icon = icons[index]
      const active = (index === 0 && page === 'dashboard')
        || (index === 1 && page === 'drivers')
        || (index === 2 && page === 'finance')
        || (index === 3 && page === 'history')
        || (index === 4 && page === 'customers')
        || (index === 5 && page === 'settings')
        || (index === 6 && page === 'support')
      return <button key={label} className={active ? 'nav-item active' : 'nav-item'} onClick={() => openPage(index)}><Icon size={18} /><span>{label}</span></button>
    })}</nav>
    <button className="logout"><LogOut size={17} />{t.logout}</button>
  </aside>
}
