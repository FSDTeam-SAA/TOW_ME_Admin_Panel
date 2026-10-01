import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import { queryClient } from '../api/queryClient'
import {
  api,
  clearSession,
  getToken,
  getStoredUser,
  storeSession,
  subscribeUnauthorized,
} from '../api/client'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const logout = useCallback(() => {
    if (getToken()) void api.logout().catch(() => {})
    clearSession()
    queryClient.clear()
    setUser(null)
  }, [])

  // A rejected token anywhere in the app drops us back to the login screen.
  useEffect(() => subscribeUnauthorized(logout), [logout])

  const login = useCallback(async (email, password) => {
    const response = await api.login(email, password)
    const account = response.data
    queryClient.clear()
    storeSession(account)
    setUser(account)
    return account
  }, [])

  const updateUser = useCallback((profile) => {
    setUser((current) => {
      const updated = { ...current, ...profile }
      storeSession(updated)
      return updated
    })
  }, [])

  useEffect(() => {
    if (!getToken()) return
    let active = true
    api.currentAdmin()
      .then((response) => { if (active && getToken()) updateUser(response.data) })
      .catch((err) => { if (active && err.status === 403) logout() })
    return () => { active = false }
  }, [logout, updateUser])

  const value = useMemo(
    () => ({ user, login, logout, updateUser }),
    [user, login, logout, updateUser],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
