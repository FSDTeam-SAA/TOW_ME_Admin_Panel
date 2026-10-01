import { useCallback } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'

/** Cache-backed server state with a stable key for each page and filter set. */
export default function useApiResource(fetcher, { queryKey, immediate = true, staleTime } = {}) {
  const client = useQueryClient()
  const query = useQuery({
    queryKey,
    queryFn: async () => (await fetcher())?.data ?? null,
    enabled: immediate,
    staleTime,
  })

  const { refetch } = query
  const reload = useCallback(() => refetch(), [refetch])
  const setData = useCallback(
    (value) => client.setQueryData(queryKey, value),
    [client, queryKey],
  )

  return {
    data: query.data ?? null,
    error: query.data == null ? query.error : null,
    loading: immediate && query.isPending,
    refreshing: query.isFetching && !query.isPending,
    reload,
    setData,
  }
}
