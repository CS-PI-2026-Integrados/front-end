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
  subscribeReceiptChanges,
  getReceiptRevision,
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
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
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
  const receiptRevision = useSyncExternalStore(subscribeReceiptChanges, getReceiptRevision)
  const queryKey = JSON.stringify([
    tenantId,
    source,
    session?.user?.id,
    search,
    year,
    month,
    startDate,
    endDate,
    page,
  ])
  const key = JSON.stringify([queryKey, revision, receiptRevision, reloadId])
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
      try {
        const result = await listDocuments({
          search,
          year,
          month: month ?? undefined,
          startDate: startDate || undefined,
          endDate: endDate || undefined,
          page: page - 1,
          size: 12,
          signal: controller.signal,
        })
        if (current)
          setState({ ...result, key, queryKey, isLoading: false, error: null, refreshError: null })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState((previous) =>
            previous.queryKey === queryKey && !previous.error
              ? {
                  ...previous,
                  key,
                  refreshError:
                    'Não foi possível atualizar a disponibilidade dos documentos. Os dados exibidos foram mantidos.',
                }
              : {
                  key,
                  queryKey,
                  items: [],
                  totalItems: 0,
                  totalPages: 1,
                  isLoading: false,
                  error: error.message,
                }
          )
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [search, year, month, startDate, endDate, page, key, queryKey])
  const result =
    state.queryKey === queryKey
      ? state
      : { items: [], totalItems: 0, totalPages: 1, isLoading: true, error: null }
  return {
    ...result,
    isRefreshing: !result.isLoading && state.key !== key,
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
    startDate,
    endDate,
    setSearch: (value) => {
      setSearch(value)
      setPage(1)
    },
    setStartDate: (value) => {
      setStartDate(value)
      setPage(1)
    },
    setEndDate: (value) => {
      setEndDate(value)
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
