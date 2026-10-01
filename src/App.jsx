import React, { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import DriverManagement from './pages/Drivers/DriverManagement'
import FinancialData from './pages/Finance/FinancialData'
import TowHistory from './pages/History/TowHistory'
import Settings from './pages/Settings/Settings'
import CustomerSupport from './pages/CustomerSupport/CustomerSupport'
import Customers from './pages/Customers/Customers'
import Login from './pages/Login/Login'
import { useAuth } from './auth/AuthContext'
import RealtimeProvider from './realtime/RealtimeProvider'

export default function App() {
  const { user, logout } = useAuth()
  const [page, setPage] = useState(() => {
    const requestedPage = new URLSearchParams(window.location.search).get('page')
    return ['dashboard', 'drivers', 'finance', 'history', 'customers', 'settings', 'support'].includes(requestedPage)
      ? requestedPage
      : 'dashboard'
  })
  const [focusedDriverId, setFocusedDriverId] = useState(null)

  const manageDriver = (id) => {
    setFocusedDriverId(id)
    setPage('drivers')
  }

  if (!user) return <Login />

  const allowedPages = user.mustChangePin ? ['settings'] : user.isMasterAdmin
    ? ['dashboard', 'drivers', 'finance', 'history', 'customers', 'settings', 'support']
    : ['dashboard', 'drivers', 'finance', 'history', 'customers', 'settings', 'support']
      .filter((item) => item === 'settings' || (user.adminPermissions || []).includes({ history: 'trips' }[item] || item))
  const currentPage = allowedPages.includes(page) ? page : allowedPages[0]
  if (!currentPage) return <div className="login-page"><div className="login-card panel">
    <p>No administrator permissions have been granted yet.</p>
    <button className="login-submit" onClick={logout}>Switch administrator</button>
  </div></div>

  const pages = {
    settings: <Settings />,
    drivers: <DriverManagement initialDriverId={focusedDriverId} />,
    finance: <FinancialData />,
    history: <TowHistory />,
    support: <CustomerSupport />,
    customers: <Customers />,
  }

  return (
    <RealtimeProvider>
      <AppLayout page={currentPage} setPage={setPage}>
        {pages[currentPage] || <Dashboard onManageDrivers={manageDriver} />}
      </AppLayout>
    </RealtimeProvider>
  )
}
