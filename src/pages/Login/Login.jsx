import React, { useEffect, useState } from 'react'
import { Clock, LogIn, Lock, UserRound } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { asset } from '../../utils/asset'
import { api } from '../../api/client'

const formatWait = (seconds) => {
  if (seconds >= 60) {
    const minutes = Math.floor(seconds / 60)
    const rest = seconds % 60
    return `${minutes}:${String(rest).padStart(2, '0')}`
  }
  return `0:${String(seconds).padStart(2, '0')}`
}

export default function Login() {
  const { t } = useLanguage()
  const { login } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockedFor, setLockedFor] = useState(0)
  const [mode, setMode] = useState('login')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [otp, setOtp] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [feedback, setFeedback] = useState('')

  // Count the lockout down so the form re-enables itself.
  useEffect(() => {
    if (lockedFor <= 0) return undefined
    const timer = setInterval(() => setLockedFor((s) => Math.max(0, s - 1)), 1000)
    return () => clearInterval(timer)
  }, [lockedFor])

  useEffect(() => {
    if (lockedFor === 0) setError((current) => (current ? '' : current))
  }, [lockedFor])

  const submit = async (event) => {
    event.preventDefault()
    if (busy || lockedFor > 0) return
    if (mode === 'reset' && newPassword !== confirmPassword) {
      setError(t.resetMismatch)
      return
    }
    setBusy(true)
    setError('')
    try {
      if (mode === 'phone') {
        await api.requestPasswordReset(phoneNumber.trim())
        setMode('reset')
        setFeedback(t.resetCodeSent)
        setBusy(false)
      } else if (mode === 'reset') {
        await api.resetPassword(phoneNumber.trim(), otp.trim(), newPassword)
        setMode('login')
        setPassword('')
        setOtp('')
        setNewPassword('')
        setConfirmPassword('')
        setFeedback(t.resetComplete)
        setBusy(false)
      } else {
        await login(username.trim(), password)
      }
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds > 0) {
        setLockedFor(err.retryAfterSeconds)
      }
      setError(err.message || t.loginFailed)
      setBusy(false)
    }
  }

  const locked = lockedFor > 0
  const changeMode = (nextMode) => {
    setMode(nextMode)
    setError('')
    setFeedback('')
  }

  return (
    <div className="login-page">
      <form className="login-card panel" onSubmit={submit}>
        <img className="login-logo" src={asset('assets/dashboard_icon/logo.png')} alt="TOW ME" />
        <h1>{mode === 'login' ? t.loginTitle : t.resetPasswordTitle}</h1>
        <p>{mode === 'login' ? t.loginSubtitle : t.resetPasswordHelp}</p>

        {mode === 'login' ? <label>
          <span>{t.adminLoginName || 'Administrator name or email'}</span>
          <div className="login-field">
            <UserRound size={17} />
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              disabled={locked}
              required
            />
          </div>
        </label> : <label>
          <span>{t.phone}</span>
          <div className="login-field">
            <UserRound size={17} />
            <input type="tel" value={phoneNumber} onChange={(event) => setPhoneNumber(event.target.value)}
              autoComplete="tel" disabled={locked} required />
          </div>
        </label>}

        {mode === 'login' && <label>
          <span>{t.password}</span>
          <div className="login-field">
            <Lock size={17} />
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              autoComplete="current-password"
              disabled={locked}
              required
            />
          </div>
        </label>}

        {mode === 'reset' && <>
          <label><span>{t.resetCode}</span><div className="login-field"><Lock size={17} />
            <input value={otp} onChange={(event) => setOtp(event.target.value)} inputMode="numeric"
              autoComplete="one-time-code" disabled={locked} required /></div></label>
          <label><span>{t.resetNewCredential}</span><div className="login-field"><Lock size={17} />
            <input type="password" value={newPassword} onChange={(event) => setNewPassword(event.target.value)}
              autoComplete="new-password" disabled={locked} required /></div></label>
          <label><span>{t.resetConfirmCredential}</span><div className="login-field"><Lock size={17} />
            <input type="password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)}
              autoComplete="new-password" disabled={locked} required /></div></label>
        </>}

        {feedback && <div className="login-feedback">{feedback}</div>}

        {error && !locked && <div className="login-error">{error}</div>}

        {locked && (
          <div className="login-lockout">
            <Clock size={16} />
            <span>{error}</span>
            <b>{formatWait(lockedFor)}</b>
          </div>
        )}

        <button className="login-submit" type="submit" disabled={busy || locked}>
          <LogIn size={18} />
          {locked ? formatWait(lockedFor) : busy ? t.signingIn
            : mode === 'phone' ? t.sendResetCode : mode === 'reset' ? t.resetCredential : t.signIn}
        </button>
        <button type="button" className="login-link" onClick={() => changeMode(mode === 'login' ? 'phone' : 'login')}>
          {mode === 'login' ? t.forgotPassword : t.backToLogin}
        </button>
      </form>
    </div>
  )
}
