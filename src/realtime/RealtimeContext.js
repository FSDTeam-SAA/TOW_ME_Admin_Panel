import { createContext, useContext, useEffect } from 'react'

export const RealtimeContext = createContext({
  connected: false,
  subscribe: () => () => {},
})

export const useRealtime = () => useContext(RealtimeContext)

/**
 * Re-runs `handler` whenever the server pushes one of `events`.
 * Pass a stable handler (useCallback) or it will resubscribe every render.
 */
export function useRealtimeEvent(events, handler) {
  const { subscribe } = useRealtime()
  useEffect(() => subscribe(events, handler), [subscribe, events, handler])
}
