import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { AuthContext } from './AuthContext'
import {
  api,
  clearSession,
  getStoredUser,
  storeSession,
  subscribeUnauthorized,
} from '../api/client'

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(getStoredUser)

  const logout = useCallback(() => {
    clearSession()
    setUser(null)
  }, [])

  // A rejected token anywhere in the app drops us back to the login screen.
  useEffect(() => subscribeUnauthorized(logout), [logout])

  const login = useCallback(async (email, password) => {
    const response = await api.login(email, password)
    const account = response.data
    storeSession(account)
    setUser(account)
    return account
  }, [])

  const value = useMemo(
    () => ({ user, login, logout }),
    [user, login, logout],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
