import React, { useEffect, useMemo, useState } from 'react'
import { ThemeContext } from './ThemeContext'

export default function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(() => {
    const requestedTheme = new URLSearchParams(window.location.search).get('theme')
    return ['light', 'dark'].includes(requestedTheme)
      ? requestedTheme
      : (localStorage.getItem('towme-theme') || 'light')
  })

  useEffect(() => {
    localStorage.setItem('towme-theme', theme)
    document.documentElement.dataset.theme = theme
    document.documentElement.style.colorScheme = theme
  }, [theme])

  const value = useMemo(() => ({
    theme,
    setTheme,
    toggleTheme: () => setTheme(current => current === 'dark' ? 'light' : 'dark'),
  }), [theme])

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}
