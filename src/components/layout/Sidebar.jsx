import React from 'react'
import {
  CircleDollarSign, ClipboardList, Headset, LayoutDashboard, LogOut,
  FileText, Settings, Truck, Users, X,
} from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'
import { asset } from '../../utils/asset'
import { useAuth } from '../../auth/AuthContext'

const icons = [LayoutDashboard, Truck, CircleDollarSign, ClipboardList, Users, Settings, Headset]
const permissions = ['dashboard', 'drivers', 'finance', 'trips', 'customers', 'settings', 'support']
const pages = ['dashboard', 'drivers', 'finance', 'history', 'customers', 'settings', 'support']

export default function Sidebar({ page, setPage, open, setOpen }) {
  const { t } = useLanguage()
  const { user, logout } = useAuth()
  const items = t.nav.map((label, index) => ({ label, page: pages[index], permission: permissions[index], Icon: icons[index] }))
  items.splice(6, 0, { label: t.termsOfUse, page: 'terms', permission: 'settings', Icon: FileText })
  const openPage = (nextPage) => {
    setPage(nextPage)
    setOpen(false)
  }

  return <aside className={open ? 'sidebar sidebar--open' : 'sidebar'}>
    <button className="mobile-close" onClick={() => setOpen(false)} aria-label="Close"><X /></button>
    <div className="logo"><img src={asset("assets/dashboard_icon/logo.png?v=1")} alt="TOW ME" /><small>{t.panel}</small></div>
    <div className="side-profile"><Avatar text={user?.name || 'Admin'} color="#f16522" large /><div><b>{user?.name || t.adminName}</b><span>{user?.isMasterAdmin ? t.adminRole : t.managerRole}</span></div></div>
    <nav>{items.map(({ label, page: itemPage, permission, Icon }) => {
      if (user?.mustChangePin && itemPage !== 'settings') return null
      if (!user?.isMasterAdmin && itemPage !== 'settings' && !user?.adminPermissions?.includes(permission)) return null
      const active = page === itemPage
      return <button key={itemPage} className={active ? 'nav-item active' : 'nav-item'} onClick={() => openPage(itemPage)}><Icon size={18} /><span>{label}</span></button>
    })}</nav>
    <button className="logout" onClick={logout}>{t.switchManager || 'Switch administrator'}</button>
    <button className="logout" onClick={logout}><LogOut size={17} />{t.logout}</button>
  </aside>
}
