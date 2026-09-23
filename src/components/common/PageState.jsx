import React from 'react'
import { AlertTriangle, RefreshCw } from 'lucide-react'

/** Shared loading / error panel so every screen fails the same way. */
export default function PageState({ loading, error, onRetry, t }) {
  if (loading) {
    return <section className="panel page-state"><span className="spinner" />{t.loading}</section>
  }
  if (error) {
    return <section className="panel page-state error">
      <AlertTriangle size={22} />
      <p>{error.message}</p>
      <button onClick={onRetry}><RefreshCw size={15} />{t.retry}</button>
    </section>
  }
  return null
}
