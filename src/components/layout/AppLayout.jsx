import React, { useState } from 'react'
import Sidebar from './Sidebar'
import Header from './Header'

export default function AppLayout({ page, setPage, children }) {
  const [open, setOpen] = useState(false)
  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} open={open} setOpen={setOpen} />
    {open && <button className="overlay" aria-label="Close menu" onClick={() => setOpen(false)} />}
    <main><Header page={page} openMenu={() => setOpen(true)} />{children}</main>
  </div>
}
