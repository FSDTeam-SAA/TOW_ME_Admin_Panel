import React, { useEffect, useState } from 'react'
import { Clock, LogIn, Lock, Mail } from 'lucide-react'
import { useAuth } from '../../auth/AuthContext'
import { useLanguage } from '../../i18n/LanguageContext'
import { asset } from '../../utils/asset'

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
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [lockedFor, setLockedFor] = useState(0)

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
    setBusy(true)
    setError('')
    try {
      await login(email.trim(), password)
    } catch (err) {
      if (err.status === 429 && err.retryAfterSeconds > 0) {
        setLockedFor(err.retryAfterSeconds)
      }
      setError(err.message || t.loginFailed)
      setBusy(false)
    }
  }

  const locked = lockedFor > 0

  return (
    <div className="login-page">
      <form className="login-card panel" onSubmit={submit}>
        <img className="login-logo" src={asset('assets/dashboard_icon/logo.png')} alt="TOW ME" />
        <h1>{t.loginTitle}</h1>
        <p>{t.loginSubtitle}</p>

        <label>
          <span>{t.email}</span>
          <div className="login-field">
            <Mail size={17} />
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              autoComplete="username"
              disabled={locked}
              required
            />
          </div>
        </label>

        <label>
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
        </label>

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
          {locked ? formatWait(lockedFor) : busy ? t.signingIn : t.signIn}
        </button>
      </form>
    </div>
  )
}
