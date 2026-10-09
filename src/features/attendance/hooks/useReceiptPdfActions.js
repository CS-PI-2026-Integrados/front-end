import { useCallback, useEffect, useRef, useState } from 'react'
import { attendanceService } from '../services/attendanceService'

export function useReceiptPdfActions() {
  const [isProcessing, setProcessing] = useState(false)
  const [error, setError] = useState(null)
  const pending = useRef(false)
  const active = useRef(true)
  const urls = useRef(new Set())
  const timers = useRef(new Set())
  const controller = useRef(null)
  const release = useCallback(() => {
    controller.current?.abort()
    setError(null)
    timers.current.forEach(clearTimeout)
    timers.current.clear()
    urls.current.forEach((url) => URL.revokeObjectURL(url))
    urls.current.clear()
  }, [])
  useEffect(() => {
    active.current = true
    const ownedUrls = urls.current
    const ownedTimers = timers.current
    return () => {
      active.current = false
      controller.current?.abort()
      ownedTimers.forEach(clearTimeout)
      ownedUrls.forEach((url) => URL.revokeObjectURL(url))
      ownedUrls.clear()
    }
  }, [])
  const run = useCallback(async (record, disposition) => {
    if (pending.current) return false
    const id = typeof record === 'string' ? record : record?.id
    if (!id) return false
    // Open synchronously to avoid browser popup blocking while the authenticated fetch runs.
    const popup = disposition === 'inline' ? window.open('', '_blank') : null
    if (popup) popup.opener = null
    pending.current = true
    setProcessing(true)
    setError(null)
    controller.current = new AbortController()
    try {
      const blob = await attendanceService.getReceipt(id, {
        disposition,
        signal: controller.current.signal,
      })
      if (!active.current) {
        popup?.close()
        return false
      }
      const url = URL.createObjectURL(blob)
      urls.current.add(url)
      if (disposition === 'inline' && popup) popup.location.replace(url)
      else {
        const anchor = document.createElement('a')
        anchor.href = url
        anchor.download = `comprovante-${id}.pdf`
        document.body.appendChild(anchor)
        anchor.click()
        anchor.remove()
      }
      let closeWatcher
      const dispose = () => {
        URL.revokeObjectURL(url)
        urls.current.delete(url)
        clearTimeout(timer)
        timers.current.delete(timer)
        if (closeWatcher) {
          clearInterval(closeWatcher)
          timers.current.delete(closeWatcher)
        }
      }
      const timer = setTimeout(dispose, disposition === 'inline' ? 300_000 : 60_000)
      timers.current.add(timer)
      if (popup) {
        closeWatcher = setInterval(() => {
          if (popup.closed) dispose()
        }, 1000)
        timers.current.add(closeWatcher)
      }
      return true
    } catch (cause) {
      popup?.close()
      if (active.current && cause.name !== 'AbortError') setError(cause.message)
      return false
    } finally {
      pending.current = false
      if (active.current) setProcessing(false)
    }
  }, [])
  return {
    download: useCallback((record) => run(record, 'attachment'), [run]),
    view: useCallback((record) => run(record, 'inline'), [run]),
    isProcessing,
    error,
    release,
  }
}
