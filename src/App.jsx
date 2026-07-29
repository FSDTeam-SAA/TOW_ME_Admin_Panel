import React, { useState } from 'react'
import AppLayout from './components/layout/AppLayout'
import Dashboard from './pages/Dashboard/Dashboard'
import DriverManagement from './pages/Drivers/DriverManagement'
import FinancialData from './pages/Finance/FinancialData'
import TowHistory from './pages/History/TowHistory'
import Settings from './pages/Settings/Settings'
import CustomerSupport from './pages/CustomerSupport/CustomerSupport'
import Customers from './pages/Customers/Customers'

export default function App() {
  const [page, setPage] = useState('dashboard')
  const pages = {
    settings: <Settings />,
    drivers: <DriverManagement />,
    finance: <FinancialData />,
    history: <TowHistory />,
    support: <CustomerSupport />,
    customers: <Customers />,
  }
  return <AppLayout page={page} setPage={setPage}>
    {pages[page] || <Dashboard />}
  </AppLayout>
}
