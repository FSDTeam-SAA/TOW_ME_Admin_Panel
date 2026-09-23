import React, { useEffect, useMemo, useRef, useState } from 'react'
import { io } from 'socket.io-client'
import { RealtimeContext } from './RealtimeContext'
import { BASE_URL, getToken } from '../api/client'

// socket.io attaches to the server root, not the /api/v1 prefix.
const SOCKET_URL = BASE_URL.replace(/\/api\/v1\/?$/, '')

export default function RealtimeProvider({ children }) {
  const [connected, setConnected] = useState(false)
  const listeners = useRef(new Map())
  const socketRef = useRef(null)

  useEffect(() => {
    const token = getToken()
    if (!token) return undefined

    const socket = io(SOCKET_URL, {
      auth: { token },
      transports: ['websocket', 'polling'],
      reconnectionDelay: 1000,
      reconnectionDelayMax: 10000,
    })
    socketRef.current = socket

    socket.on('connect', () => setConnected(true))
    socket.on('disconnect', () => setConnected(false))
    socket.on('connect_error', () => setConnected(false))

    const forward = (event) => (payload) => {
      const handlers = listeners.current.get(event)
      if (handlers) handlers.forEach((handler) => handler(payload))
    }

    const events = ['trip:created', 'trip:updated', 'driver:updated']
    events.forEach((event) => socket.on(event, forward(event)))

    return () => {
      socket.close()
      socketRef.current = null
      setConnected(false)
    }
  }, [])

  const value = useMemo(
    () => ({
      connected,
      /** Subscribe to one or more server events; returns an unsubscribe fn. */
      subscribe(events, handler) {
        const names = Array.isArray(events) ? events : [events]
        names.forEach((name) => {
          if (!listeners.current.has(name)) listeners.current.set(name, new Set())
          listeners.current.get(name).add(handler)
        })
        return () => {
          names.forEach((name) => listeners.current.get(name)?.delete(handler))
        }
      },
    }),
    [connected],
  )

  return (
    <RealtimeContext.Provider value={value}>{children}</RealtimeContext.Provider>
  )
}
