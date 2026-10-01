import React, { useState } from 'react'
import { Bell, Check, ChevronRight, Globe2, LockKeyhole, Save, ShieldCheck, UserRound } from 'lucide-react'
import Avatar from '../../components/common/Avatar'
import { useLanguage } from '../../i18n/LanguageContext'
import { useTheme } from '../../theme/ThemeContext'
import { useAuth } from '../../auth/AuthContext'
import { api } from '../../api/client'
import Managers from './Managers'

function Toggle({ checked, onChange }) {
  return <button className={`toggle ${checked ? 'toggle--on' : ''}`} onClick={() => onChange(!checked)} aria-pressed={checked}><span /></button>
}

export default function Settings() {
  const { t, language, setLanguage } = useLanguage()
  const { theme, toggleTheme } = useTheme()
  const { user, updateUser, logout } = useAuth()
  const canChangeSettings = user?.isMasterAdmin || user?.adminPermissions?.includes('settings')
  const [profile, setProfile] = useState(() => ({
    name: user?.name || '', email: user?.email || '', phoneNumber: user?.phoneNumber || '',
  }))
  const [alerts, setAlerts] = useState([true, true, false])
  const [saved, setSaved] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [credentialOpen, setCredentialOpen] = useState(user?.mustChangePin === true)
  const [credential, setCredential] = useState({ currentPassword: '', newPassword: '' })
  const [credentialError, setCredentialError] = useState('')

  const changeCredential = async (event) => {
    event.preventDefault()
    setSaving(true)
    setCredentialError('')
    try {
      await api.changeAdminCredential(credential.currentPassword, credential.newPassword)
      logout()
    } catch (err) {
      setCredentialError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const save = async (event) => {
    event.preventDefault()
    setSaving(true)
    setSaved(false)
    setError('')
    try {
      const response = await api.updateAdminProfile(profile)
      updateUser(response.data)
      setProfile(response.data)
      setSaved(true)
      window.setTimeout(() => setSaved(false), 2500)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return <div className="content settings-page">
    {user?.mustChangePin && <div className="login-error" role="status">{t.changePinBeforeAccess || 'Choose your own four-digit PIN to continue.'}</div>}
    {saved && <div className="save-toast"><Check size={18} />{t.saved}</div>}
    <div className="settings-grid">
      <form className="panel settings-card profile-card" onSubmit={save}>
        <div className="settings-card-head"><span className="setting-title-icon"><UserRound /></span><div><h2>{t.profileSettings}</h2><p>{t.profileHelp}</p></div></div>
        <div className="profile-editor"><Avatar text={profile.name || 'Admin'} color="#f16522" large /><div><b>{profile.name || t.adminName}</b><span>{user?.isMasterAdmin ? t.adminRole : t.managerRole}</span></div></div>
        <div className="form-grid">
          <label><span>{t.fullName}</span><input required value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} /></label>
          <label><span>{t.email}</span><input required type="email" dir="ltr" value={profile.email} onChange={(e) => setProfile({ ...profile, email: e.target.value })} /></label>
          <label><span>{t.phone}</span><input required type="tel" dir="ltr" value={profile.phoneNumber} onChange={(e) => setProfile({ ...profile, phoneNumber: e.target.value })} /></label>
        </div>
        {error && <div className="login-error">{error}</div>}
        <button className="save-button" type="submit" disabled={saving}><Save size={17} />{saving ? t.loading : t.save}</button>
      </form>

      {canChangeSettings && <section className="panel settings-card language-card">
        <div className="settings-card-head"><span className="setting-title-icon blue"><Globe2 /></span><div><h2>{t.appearance}</h2><p>{t.appearanceHelp}</p></div></div>
        <div className="setting-row language-row"><div><b>{t.appLanguage}</b><span>{t.appLanguageHelp}</span></div><div className="language-picker">
          <button className={language === 'he' ? 'selected' : ''} onClick={() => setLanguage('he')}><span>עב</span>{t.hebrew}{language === 'he' && <Check />}</button>
          <button className={language === 'en' ? 'selected' : ''} onClick={() => setLanguage('en')}><span>EN</span>{t.english}{language === 'en' && <Check />}</button>
        </div></div>
        <div className="setting-row"><div><b>{t.darkMode}</b><span>{t.darkModeHelp}</span></div><Toggle checked={theme === 'dark'} onChange={toggleTheme} /></div>
      </section>}

      {canChangeSettings && <section className="panel settings-card">
        <div className="settings-card-head"><span className="setting-title-icon amber"><Bell /></span><div><h2>{t.notifications}</h2><p>{t.notificationsHelp}</p></div></div>
        {[[t.newTowAlerts, t.newTowHelp], [t.driverAlerts, t.driverHelp], [t.financeAlerts, t.financeHelp]].map((item, i) => <div className="setting-row" key={item[0]}><div><b>{item[0]}</b><span>{item[1]}</span></div><Toggle checked={alerts[i]} onChange={value => setAlerts(current => current.map((x, index) => index === i ? value : x))} /></div>)}
      </section>}

      <section className="panel settings-card">
        <div className="settings-card-head"><span className="setting-title-icon green"><ShieldCheck /></span><div><h2>{t.security}</h2><p>{t.securityHelp}</p></div></div>
        <button type="button" className="security-row" onClick={() => setCredentialOpen((value) => !value)}><span className="security-icon"><LockKeyhole /></span><b>{user?.isMasterAdmin ? t.changePassword : t.managerPin}</b><ChevronRight /></button>
        {credentialOpen && <form className="credential-form" onSubmit={changeCredential}>
          <label><span>{t.currentPassword || 'Current code'}</span><input type="password" required value={credential.currentPassword} onChange={(e) => setCredential({ ...credential, currentPassword: e.target.value })} /></label>
          <label><span>{user?.isMasterAdmin ? t.newPassword : t.managerPin}</span><input type="password" required inputMode={user?.isMasterAdmin ? undefined : 'numeric'} pattern={user?.isMasterAdmin ? undefined : '[0-9]{4}'} minLength={user?.isMasterAdmin ? 6 : 4} maxLength={user?.isMasterAdmin ? undefined : 4} value={credential.newPassword} onChange={(e) => setCredential({ ...credential, newPassword: e.target.value })} /></label>
          {credentialError && <div className="login-error">{credentialError}</div>}
          <button type="submit" className="save-button" disabled={saving}>{saving ? t.loading : t.save}</button>
        </form>}
      </section>
    </div>
    {user?.isMasterAdmin && <Managers />}
  </div>
}
