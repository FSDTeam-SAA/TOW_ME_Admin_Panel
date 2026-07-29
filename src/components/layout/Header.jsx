import React from 'react'
import { Bell, Menu } from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Header({ page, openMenu }) {
  const { t } = useLanguage()
  const heading = page === 'settings' ? t.settings : page === 'drivers' ? t.driversPageTitle : page === 'finance' ? t.financeTitle : page === 'history' ? t.historyTitle : t.dashboard
  const subtitle = page === 'settings' ? t.settingsSubtitle : page === 'drivers' ? t.driversPageSubtitle : page === 'finance' ? t.financeSubtitle : page === 'history' ? t.historySubtitle : t.welcome
  return <header className="topbar">
    <div className="title"><h1>{heading}</h1><p>{subtitle}</p></div>
    <div className="top-actions">
      <button className="menu-btn" onClick={openMenu}><Menu /></button>
      <button className="bell"><Bell size={19} /><span>3</span></button>
      <Avatar text="AC" color="#f16522" />
    </div>
  </header>
}
