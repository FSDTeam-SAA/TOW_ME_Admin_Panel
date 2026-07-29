import React, { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import Settings from './pages/Settings/Settings'

export default function App() {
  const [page, setPage] = useState('dashboard')
  return <AppLayout page={page} setPage={setPage}>
    {page === 'settings' ? <Settings /> : <Dashboard />}
  </AppLayout>
}
