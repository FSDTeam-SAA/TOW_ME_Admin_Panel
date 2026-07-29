import React from 'react'
import { Bell, Menu } from 'lucide-react'
import Avatar from '../common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

export default function Header({ page, openMenu }) {
  const { t } = useLanguage()
  return <header className="topbar">
    <div className="title"><h1>{page === 'settings' ? t.settings : t.dashboard}</h1><p>{page === 'settings' ? t.settingsSubtitle : t.welcome}</p></div>
    <div className="top-actions">
      <button className="menu-btn" onClick={openMenu}><Menu /></button>
      <button className="bell"><Bell size={19} /><span>3</span></button>
      <Avatar text="AC" color="#f16522" />
    </div>
  </header>
}
