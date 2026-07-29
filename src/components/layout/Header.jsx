import React from 'react'
import { Bell, Menu } from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Header({ page, openMenu }) {
  const { t } = useLanguage()
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
      <Avatar text="AC" color="#f16522" />
      <button className="bell"><Bell size={19} /><span>3</span></button>
    </div>
  </header>
}
