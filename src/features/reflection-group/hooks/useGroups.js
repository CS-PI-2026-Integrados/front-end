import { useCallback, useEffect, useRef, useState } from 'react'
import { useSession } from '@/features/authentication'
import { groupsService } from '../services/groupsService'

const initial = {
  items: [],
  group: null,
  totalItems: 0,
  totalPages: 1,
  isLoading: true,
  error: null,
}
export function useGroups({ name = '', subject = '', status = '', page = 1, size = 5, id } = {}) {
  const { session } = useSession()
  const scope = `${session?.user?.id || ''}:${session?.tenant?.id || ''}:${id || ''}`
  const [revision, setRevision] = useState(0)
  const [state, setState] = useState(initial)
  const [isSaving, setSaving] = useState(false)
  const [mutationError, setMutationError] = useState(null)
  const pending = useRef(false)
  const active = useRef(true)
  const currentScope = useRef(scope)
  currentScope.current = scope
  const key = JSON.stringify([scope, name, subject, status, page, size, revision])
  const reload = useCallback(() => setRevision((value) => value + 1), [])
  useEffect(() => {
    active.current = true
    return () => {
      active.current = false
    }
  }, [])
  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const timer = setTimeout(async () => {
      try {
        const data = id
          ? { group: await groupsService.getById(id, { signal: controller.signal }) }
          : await groupsService.list({
              name,
              subject,
              status,
              page: page - 1,
              size,
              signal: controller.signal,
            })
        // The list endpoint omits planning fields needed by the table and edit form.
        if (!id) {
          data.items = await Promise.all(
            data.items.map(async (item) => ({
              ...(await groupsService.getById(item.id, { signal: controller.signal })),
              ...item,
            }))
          )
        }
        if (current) setState({ ...initial, ...data, key, isLoading: false })
      } catch (error) {
        if (current && error.name !== 'AbortError')
          setState({ ...initial, key, error: error.message, isLoading: false })
      }
    }, 250)
    return () => {
      current = false
      clearTimeout(timer)
      controller.abort()
    }
  }, [name, subject, status, page, size, id, key])
  const mutate = useCallback(
    async (operation, ...args) => {
      if (pending.current) return null
      const startedScope = currentScope.current
      pending.current = true
      setSaving(true)
      setMutationError(null)
      try {
        const result = await groupsService[operation](...args)
        if (active.current && startedScope === currentScope.current) reload()
        return result
      } catch (error) {
        if (active.current && startedScope === currentScope.current) setMutationError(error.message)
        throw error
      } finally {
        pending.current = false
        if (active.current && startedScope === currentScope.current) setSaving(false)
      }
    },
    [reload]
  )
  const result = state.key === key ? state : initial
  return {
    ...result,
    totalPages: Math.max(1, result.totalPages),
    reload,
    mutate,
    isSaving,
    mutationError,
    canManage: ['admin', 'operator'].includes(session?.user?.role?.key),
  }
}
