import { useCallback, useMemo, useState, useSyncExternalStore } from 'react'
import { observarComprovantes, obterSnapshotComprovantes } from '@/features/attendance'
import {
  listDocuments,
  listGroupDocuments,
  readViewPreference,
  saveViewPreference,
} from '../services/documentsService'

const MONTH_COUNT = 12

export function useDocuments(tenantId, source = 'attendance') {
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [manualMonth, setManualMonth] = useState(null)
  const [viewMode, setViewMode] = useState(readViewPreference)

  useSyncExternalStore(observarComprovantes, obterSnapshotComprovantes)

  const documents = useMemo(() => {
    if (!tenantId) return []
    return source === 'group' ? listGroupDocuments(tenantId) : listDocuments(tenantId)
  }, [tenantId, source])

  const availableYears = useMemo(() => {
    const years = new Set(documents.map((document) => new Date(document.issuedAt).getFullYear()))
    const list = Array.from(years).sort((a, b) => b - a)
    return list.length > 0 ? list : [new Date().getFullYear()]
  }, [documents])

  const countByMonth = useMemo(() => {
    const counts = Array(MONTH_COUNT).fill(0)
    documents
      .filter((document) => new Date(document.issuedAt).getFullYear() === selectedYear)
      .forEach((document) => {
        counts[new Date(document.issuedAt).getMonth()]++
      })
    return counts
  }, [documents, selectedYear])

  const mostRecentMonthWithRecords = useMemo(() => {
    for (let month = MONTH_COUNT - 1; month >= 0; month--) {
      if (countByMonth[month] > 0) return month
    }
    return new Date().getMonth()
  }, [countByMonth])

  const selectedMonth = manualMonth !== null ? manualMonth : mostRecentMonthWithRecords

  const monthDocuments = useMemo(() => {
    return documents.filter((document) => {
      const date = new Date(document.issuedAt)
      return date.getFullYear() === selectedYear && date.getMonth() === selectedMonth
    })
  }, [documents, selectedYear, selectedMonth])

  const filteredDocuments = useMemo(() => {
    const term = search.toLowerCase().trim()
    if (!term) return monthDocuments

    return monthDocuments.filter((document) => {
      const name = (document.convictedName || '').toLowerCase()
      const process = (document.processNumber || '').toLowerCase()
      return name.includes(term) || process.includes(term)
    })
  }, [monthDocuments, search])

  const selectYear = useCallback((year) => {
    setSelectedYear(year)
    setManualMonth(null)
    setSearch('')
  }, [])

  const selectMonth = useCallback((month) => {
    setManualMonth(month)
    setSearch('')
  }, [])

  const changeViewMode = useCallback((mode) => {
    setViewMode(mode)
    saveViewPreference(mode)
  }, [])

  return {
    search,
    setSearch,
    hasSearch: search.trim() !== '',
    selectedYear,
    selectYear,
    availableYears,
    selectedMonth,
    selectMonth,
    countByMonth,
    viewMode,
    changeViewMode,
    monthDocuments,
    filteredDocuments,
  }
}
