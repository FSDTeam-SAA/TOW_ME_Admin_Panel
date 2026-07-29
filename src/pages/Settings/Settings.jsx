import React, { useState } from 'react'
import { Bell, Check, ChevronRight, Globe2, LockKeyhole, Save, ShieldCheck, UserRound } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'

function Toggle({ checked, onChange }) {
  return <button className={`toggle ${checked ? 'toggle--on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>
}

export default function Settings() {
  const { t, language, setLanguage } = useLanguage()
  const [alerts, setAlerts] = useState([true, true, false])
  const [saved, setSaved] = useState(false)

  const save = () => {
    setSaved(true)
    window.setTimeout(() => setSaved(false), 2500)
  }

  return <div className="content settings-page">
    {saved && <div className="save-toast"><Check size={18} />{t.saved}</div>}
    <div className="settings-grid">
      <section className="panel settings-card profile-card">
        <div className="settings-card-head"><span className="setting-title-icon"><UserRound /></span><div><h2>{t.profileSettings}</h2><p>{t.profileHelp}</p></div></div>
        <div className="profile-editor"><Avatar text="AC" color="#f16522" large /><div><b>{t.adminName}</b><span>{t.adminRole}</span></div></div>
        <div className="form-grid">
          <label><span>{t.fullName}</span><input defaultValue={t.adminName} /></label>
          <label><span>{t.email}</span><input dir="ltr" defaultValue="alon@towme.co.il" /></label>
          <label><span>{t.phone}</span><input dir="ltr" defaultValue="+972 50-123-4567" /></label>
        </div>
        <button className="save-button" onClick={save}><Save size={17} />{t.save}</button>
      </section>

      <section className="panel settings-card language-card">
        <div className="settings-card-head"><span className="setting-title-icon blue"><Globe2 /></span><div><h2>{t.appearance}</h2><p>{t.appearanceHelp}</p></div></div>
        <div className="setting-row language-row"><div><b>{t.appLanguage}</b><span>{t.appLanguageHelp}</span></div><div className="language-picker">
          <button className={language === 'he' ? 'selected' : ''} onClick={() => setLanguage('he')}><span>עב</span>{t.hebrew}{language === 'he' && <Check />}</button>
          <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}><span>EN</span>{t.english}{language === 'en' && <Check />}</button>
        </div></div>
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><span className="setting-title-icon amber"><Bell /></span><div><h2>{t.notifications}</h2><p>{t.notificationsHelp}</p></div></div>
        {[[t.newTowAlerts, t.newTowHelp], [t.driverAlerts, t.driverHelp], [t.financeAlerts, t.financeHelp]].map((item, i) => <div className="setting-row" key={item[0]}><div><b>{item[0]}</b><span>{item[1]}</span></div><Toggle checked={alerts[i]} onChange={value => setAlerts(current => current.map((x, index) => index === i ? value : x))} /></div>)}
      </section>

      <section className="panel settings-card">
        <div className="settings-card-head"><span className="setting-title-icon green"><ShieldCheck /></span><div><h2>{t.security}</h2><p>{t.securityHelp}</p></div></div>
        <button className="security-row"><span className="security-icon"><LockKeyhole /></span><b>{t.changePassword}</b><ChevronRight /></button>
        <div className="security-row"><span className="security-icon"><ShieldCheck /></span><b>{t.twoFactor}</b><span className="enabled">{t.enabled}</span></div>
      </section>
    </div>
  </div>
}
