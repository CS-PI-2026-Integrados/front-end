import { useCallback, useEffect, useState, useSyncExternalStore } from 'react'
import { useSession } from '@/features/authentication'
import {
  listDocuments,
  listDocumentYears,
  listDocumentMonths,
  readViewPreference,
  saveViewPreference,
  subscribeAttendanceChanges,
  getAttendanceRevision,
} from '../services/documentsService'

export function useDocuments(tenantId, source = 'attendance', initialSearch = '') {
  const { session } = useSession()
  const [search, setSearch] = useState(initialSearch)
  const [page, setPage] = useState(1)
  const [year, setYear] = useState(() =>
    Number(
      new Intl.DateTimeFormat('en', { year: 'numeric', timeZone: 'America/Sao_Paulo' }).format(
        new Date()
      )
    )
  )
  const [month, setMonth] = useState(() =>
    Number(
      new Intl.DateTimeFormat('en', { month: 'numeric', timeZone: 'America/Sao_Paulo' }).format(
        new Date()
      )
    )
  )
  const [yearsState, setYearsState] = useState({ years: [], isLoading: true, error: null })
  const [monthsState, setMonthsState] = useState({ counts: [], error: null })
  const [viewMode, setViewMode] = useState(readViewPreference)
  const [reloadId, setReloadId] = useState(0)
  const [state, setState] = useState({
    items: [],
    totalItems: 0,
    totalPages: 1,
    isLoading: true,
    error: null,
  })
  const revision = useSyncExternalStore(subscribeAttendanceChanges, getAttendanceRevision)
  const key = JSON.stringify([
    tenantId,
    source,
    session?.user?.id,
    search,
    year,
    month,
    page,
    revision,
    reloadId,
  ])
  const yearsKey = JSON.stringify([tenantId, session?.user?.id, revision, reloadId])
  const monthsKey = JSON.stringify([tenantId, session?.user?.id, year, revision, reloadId])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    listDocumentMonths(year, { signal: controller.signal })
      .then((counts) => {
        if (current) setMonthsState({ key: monthsKey, counts, error: null })
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError')
          setMonthsState({ key: monthsKey, counts: [], error: error.message })
      })
    return () => {
      current = false
      controller.abort()
    }
  }, [year, monthsKey])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    listDocumentYears({ signal: controller.signal })
      .then((years) => {
        if (current) setYearsState({ key: yearsKey, years, isLoading: false, error: null })
      })
      .catch((error) => {
        if (current && error.name !== 'AbortError')
          setYearsState({ key: yearsKey, years: [], isLoading: false, error: error.message })
      })
    return () => {
      current = false
      controller.abort()
    }
  }, [yearsKey])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const timer = setTimeout(async () => {
      setState({ items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null })
      try {
        const result = await listDocuments({
          search,
          year,
          month: month ?? undefined,
          page: page - 1,
          size: 12,
          signal: controller.signal,
        })
        if (current) setState({ ...result, key, isLoading: false, error: null })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState({
            key,
            items: [],
            totalItems: 0,
            totalPages: 1,
            isLoading: false,
            error: error.message,
          })
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, year, month, page, tenantId, source, session?.user?.id, revision, reloadId, key])
  const result =
    state.key === key
      ? state
      : { items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null }
  return {
    ...result,
    totalPages: Math.max(1, result.totalPages),
    page,
    setPage,
    year,
    month,
    years: yearsState.key === yearsKey ? yearsState.years : [],
    yearsLoading: yearsState.key !== yearsKey || yearsState.isLoading,
    yearsError: yearsState.key === yearsKey ? yearsState.error : null,
    monthCounts: monthsState.key === monthsKey ? monthsState.counts : [],
    monthsLoading: monthsState.key !== monthsKey,
    monthsError: monthsState.key === monthsKey ? monthsState.error : null,
    setYear: (value) => {
      setYear(value)
      setMonth(null)
      setPage(1)
    },
    toggleMonth: (value) => {
      setMonth((selected) => (selected === value ? null : value))
      setPage(1)
    },
    search,
    setSearch: (value) => {
      setSearch(value)
      setPage(1)
    },
    viewMode,
    changeViewMode: useCallback((value) => {
      setViewMode(value)
      saveViewPreference(value)
    }, []),
    reload: () => setReloadId((value) => value + 1),
  }
}
