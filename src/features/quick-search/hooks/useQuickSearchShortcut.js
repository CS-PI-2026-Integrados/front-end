import { useEffect, useState } from 'react'

export function useQuickSearchShortcut() {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((isOpen) => !isOpen)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [])

  return { open, setOpen }
}
