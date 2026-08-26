import { useMemo, useState, useSyncExternalStore } from 'react'
import { observarComprovantes, obterSnapshotComprovantes } from '@/features/attendance'
import {
  listDocuments,
  listDocumentConvicteds,
  readViewPreference,
  saveViewPreference,
} from '../services/documentsService'

const MONTH_COUNT = 12

function getProcessNumber(document, convicteds) {
  const convicted = convicteds.find((item) => String(item.id) === String(document.convictedId))
  if (!convicted) return '—'
  const process = convicted.processes.find((item) => String(item.id) === String(document.processId))
  return process?.processNumber || '—'
}

export function useDocuments(tenantId) {
  const [activeTab, setActiveTab] = useState('attendance')
  const [search, setSearch] = useState('')
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [manualMonth, setManualMonth] = useState(null)
  const [viewMode, setViewMode] = useState(readViewPreference)

  useSyncExternalStore(observarComprovantes, obterSnapshotComprovantes)

  const documents = useMemo(() => (tenantId ? listDocuments(tenantId) : []), [tenantId])
  const convicteds = useMemo(() => (tenantId ? listDocumentConvicteds(tenantId) : []), [tenantId])

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
      const process = getProcessNumber(document, convicteds).toLowerCase()
      return name.includes(term) || process.includes(term)
    })
  }, [monthDocuments, search, convicteds])

  function selectYear(year) {
    setSelectedYear(year)
    setManualMonth(null)
    setSearch('')
  }

  function selectMonth(month) {
    setManualMonth(month)
    setSearch('')
  }

  function changeViewMode(mode) {
    setViewMode(mode)
    saveViewPreference(mode)
  }

  return {
    activeTab,
    setActiveTab,
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
    getProcessNumber: (document) => getProcessNumber(document, convicteds),
  }
}
