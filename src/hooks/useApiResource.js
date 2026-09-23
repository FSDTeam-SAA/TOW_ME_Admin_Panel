import { useCallback, useEffect, useRef, useState } from 'react'

/**
 * Loads data from the API and exposes a stable `reload` so realtime events can
 * refresh a screen without flashing a spinner at the user.
 *
 * `fetcher` must be memoised by the caller, otherwise this refetches forever.
 */
export default function useApiResource(fetcher, { immediate = true } = {}) {
  const [data, setData] = useState(null)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(immediate)
  const alive = useRef(true)

  useEffect(() => {
    alive.current = true
    return () => {
      alive.current = false
    }
  }, [])

  const load = useCallback(
    async ({ silent = false } = {}) => {
      if (!silent) setLoading(true)
      try {
        const response = await fetcher()
        if (!alive.current) return
        setData(response?.data ?? null)
        setError(null)
      } catch (err) {
        if (!alive.current) return
        setError(err)
      } finally {
        if (alive.current) setLoading(false)
      }
    },
    [fetcher],
  )

  useEffect(() => {
    if (immediate) load()
  }, [load, immediate])

  const reload = useCallback(() => load({ silent: true }), [load])

  return { data, error, loading, reload, setData }
}
