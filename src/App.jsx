import React, { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import DriverManagement from './pages/Drivers/DriverManagement'
import FinancialData from './pages/Finance/FinancialData'
import TowHistory from './pages/History/TowHistory'
import Settings from './pages/Settings/Settings'

export default function App() {
  const [page, setPage] = useState('dashboard')
  return <AppLayout page={page} setPage={setPage}>
    {page === 'settings' ? <Settings /> : page === 'drivers' ? <DriverManagement /> : page === 'finance' ? <FinancialData /> : page === 'history' ? <TowHistory /> : <Dashboard />}
  </AppLayout>
}
