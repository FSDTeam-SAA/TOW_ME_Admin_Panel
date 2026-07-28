import {
  Bell,
  CarFront,
  ChevronDown,
  CircleDollarSign,
  LayoutDashboard,
  Menu,
  Search,
  Settings,
  Truck,
  Users,
  X,
} from 'lucide-react'
import { useState } from 'react'

const navigation = [
  { label: 'Dashboard', icon: LayoutDashboard, active: true },
  { label: 'Tow Requests', icon: Truck },
  { label: 'Drivers', icon: Users },
  { label: 'Vehicles', icon: CarFront },
  { label: 'Payments', icon: CircleDollarSign },
]

const stats = [
  { label: 'Active requests', value: '24', note: '6 awaiting drivers' },
  { label: 'Available drivers', value: '18', note: 'Out of 32 drivers' },
  { label: "Today's revenue", value: '$4,280', note: '12.4% from yesterday' },
]

const requests = [
  { id: '#TM-2048', customer: 'Alex Morgan', location: 'Downtown', status: 'Assigned' },
  { id: '#TM-2047', customer: 'Sara Wilson', location: 'West End', status: 'Pending' },
  { id: '#TM-2046', customer: 'James Lee', location: 'Airport Rd', status: 'Completed' },
  { id: '#TM-2045', customer: 'Nadia Khan', location: 'North Park', status: 'Assigned' },
]

function App() {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="app-shell">
      <aside className={sidebarOpen ? 'sidebar sidebar--open' : 'sidebar'}>
        <div className="brand">
          <span className="brand-mark"><Truck size={22} /></span>
          <span>TOW Me</span>
          <button className="icon-button close-menu" onClick={() => setSidebarOpen(false)} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>

        <nav>
          {navigation.map(({ label, icon: Icon, active }) => (
            <button className={active ? 'nav-item nav-item--active' : 'nav-item'} key={label}>
              <Icon size={19} />
              <span>{label}</span>
            </button>
          ))}
        </nav>

        <button className="nav-item settings">
          <Settings size={19} />
          <span>Settings</span>
        </button>
      </aside>

      {sidebarOpen && <button className="overlay" onClick={() => setSidebarOpen(false)} aria-label="Close menu" />}

      <main>
        <header className="topbar">
          <button className="icon-button menu-button" onClick={() => setSidebarOpen(true)} aria-label="Open menu">
            <Menu size={21} />
          </button>
          <div className="search">
            <Search size={18} />
            <input aria-label="Search" placeholder="Search requests, drivers..." />
          </div>
          <div className="profile-actions">
            <button className="icon-button" aria-label="Notifications"><Bell size={20} /></button>
            <button className="profile">
              <span className="avatar">AD</span>
              <span className="profile-copy"><strong>Admin</strong><small>Operations</small></span>
              <ChevronDown size={16} />
            </button>
          </div>
        </header>

        <div className="content">
          <div className="page-heading">
            <div>
              <p className="eyebrow">OPERATIONS OVERVIEW</p>
              <h1>Dashboard</h1>
            </div>
            <button className="primary-button">New tow request</button>
          </div>

          <section className="stats-grid" aria-label="Key metrics">
            {stats.map((stat) => (
              <article className="stat-card" key={stat.label}>
                <p>{stat.label}</p>
                <strong>{stat.value}</strong>
                <span>{stat.note}</span>
              </article>
            ))}
          </section>

          <section className="table-section">
            <div className="section-heading">
              <div>
                <h2>Recent tow requests</h2>
                <p>Latest activity from your service area</p>
              </div>
              <button className="text-button">View all</button>
            </div>
            <div className="table-wrap">
              <table>
                <thead>
                  <tr><th>Request</th><th>Customer</th><th>Location</th><th>Status</th></tr>
                </thead>
                <tbody>
                  {requests.map((request) => (
                    <tr key={request.id}>
                      <td><strong>{request.id}</strong></td>
                      <td>{request.customer}</td>
                      <td>{request.location}</td>
                      <td><span className={`status status--${request.status.toLowerCase()}`}>{request.status}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>
    </div>
  )
}

export default App
