import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import toast from 'react-hot-toast'
import { useSession } from '@/features/authentication'
import {
  createTenantOperator,
  deactivateTenantUser,
  listManageableTenantUsers,
  reactivateTenantUser,
  resetTenantUserPassword,
} from '@/features/users/services/usersService'
import { normalizeSearch } from '@/features/users/utils/userFormattersUtils'

export const USERS_STATUS_FILTERS = { ALL: 'all', ACTIVE: 'active', INACTIVE: 'inactive' }
const EMPTY_USERS = []
const initial = { users: EMPTY_USERS, error: null, isLoading: true }

export function useUsersManagement() {
  const { session } = useSession()
  const userId = session?.user?.id
  const userTenantId = session?.user?.tenantId
  const tenantId = session?.tenant?.id
  const roleKey = session?.user?.role?.key
  // Focus-driven session restoration must not reload an unchanged list.
  const managementSession = useMemo(
    () => ({
      user: { id: userId, tenantId: userTenantId, role: { key: roleKey } },
      tenant: { id: tenantId },
    }),
    [userId, userTenantId, tenantId, roleKey]
  )
  const scope = JSON.stringify([userId, userTenantId, tenantId, roleKey])
  const [revision, setRevision] = useState(0)
  const key = `${scope}:${revision}`
  const [state, setState] = useState(initial)
  const [mutation, setMutation] = useState({ scope: null, busy: false, error: null })
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
  const [statusFilter, setStatusFilter] = useState(USERS_STATUS_FILTERS.ALL)
  const activeScope = useRef(null)
  const pending = useRef(null)
  const reload = useCallback(() => setRevision((value) => value + 1), [])
  const clearMutationError = useCallback(
    () => setMutation((current) => ({ ...current, error: null })),
    []
  )

  useEffect(() => {
    activeScope.current = scope
    return () => {
      activeScope.current = null
      pending.current?.abort()
      pending.current = null
    }
  }, [scope])

  useEffect(() => {
    const controller = new AbortController()
    let current = true
    const load = async () => {
      try {
        const users = await listManageableTenantUsers(managementSession, {
          signal: controller.signal,
        })
        if (current) setState({ users, key, error: null, isLoading: false })
      } catch (cause) {
        if (current && cause.name !== 'AbortError') {
          setState({ ...initial, key, error: cause.message, isLoading: false })
        }
      }
    }
    void load()
    return () => {
      current = false
      controller.abort()
    }
  }, [managementSession, key])

  const result = state.key === key ? state : initial
  const users = result.users
  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeSearch(search)
    const searchDigits = search.replace(/\D/g, '')
    return users
      .filter((user) => {
        const matchesStatus =
          statusFilter === USERS_STATUS_FILTERS.ALL ||
          (statusFilter === USERS_STATUS_FILTERS.ACTIVE && user.isActive) ||
          (statusFilter === USERS_STATUS_FILTERS.INACTIVE && !user.isActive)
        if (!matchesStatus || (roleFilter !== 'all' && user.roleId !== roleFilter)) return false
        if (!normalizedSearch && !searchDigits) return true
        return (
          (normalizedSearch && normalizeSearch(user.name).includes(normalizedSearch)) ||
          (searchDigits && user.cpf.replace(/\D/g, '').includes(searchDigits))
        )
      })
      .sort((first, second) =>
        first.name.localeCompare(second.name, 'pt-BR', { sensitivity: 'base' })
      )
  }, [users, search, roleFilter, statusFilter])
  const roleOptions = useMemo(
    () =>
      [...new Map(users.map((user) => [user.role.id, user.role])).values()].sort(
        (first, second) => second.level - first.level
      ),
    [users]
  )
  const metrics = useMemo(() => {
    const active = users.filter((user) => user.isActive).length
    return { total: users.length, active, inactive: users.length - active }
  }, [users])

  const mutate = useCallback(
    async (operation, input, message) => {
      if (pending.current) throw new Error('Aguarde a conclusão da ação em andamento.')
      const controller = new AbortController()
      pending.current = controller
      setMutation({ scope, busy: true, error: null })
      const isCurrent = () => activeScope.current === scope && !controller.signal.aborted
      try {
        const data = await operation(input, { signal: controller.signal })
        if (!isCurrent()) throw new DOMException('Operação cancelada.', 'AbortError')
        const user = data.user || data
        // Update from the accepted response, without coupling success to a second request.
        setState((current) => {
          if (current.key !== key) return current
          const exists = current.users.some((item) => item.id === user.id)
          return {
            ...current,
            users: exists
              ? current.users.map((item) => (item.id === user.id ? user : item))
              : [...current.users, user],
          }
        })
        toast.success(message)
        return data
      } catch (cause) {
        if (isCurrent() && cause.name !== 'AbortError') {
          setMutation({
            scope,
            busy: false,
            error: cause.message || 'Não foi possível concluir a ação.',
          })
        }
        throw cause
      } finally {
        if (pending.current === controller) pending.current = null
        if (isCurrent()) setMutation((current) => ({ ...current, busy: false }))
      }
    },
    [scope, key]
  )
  const createOperator = (operatorData) =>
    mutate(
      createTenantOperator,
      { session: managementSession, operatorData },
      'Usuário cadastrado com sucesso.'
    )
  const deactivateUser = (user) =>
    mutate(
      deactivateTenantUser,
      { session: managementSession, targetUserId: user.id },
      'Usuário desativado com sucesso.'
    )
  const reactivateUser = (user) =>
    mutate(
      reactivateTenantUser,
      { session: managementSession, targetUserId: user.id },
      'Usuário reativado com sucesso.'
    )
  const resetUserPassword = async (user) => {
    const data = await mutate(
      resetTenantUserPassword,
      { session: managementSession, targetUserId: user.id },
      'Senha redefinida com sucesso.'
    )
    return data.temporaryPassword
  }

  return {
    currentUser: session?.user,
    scope,
    filteredUsers,
    isLoading: result.isLoading,
    error: result.error,
    isSaving: mutation.scope === scope && mutation.busy,
    mutationError: mutation.scope === scope ? mutation.error : null,
    clearMutationError,
    reload,
    metrics,
    roleFilter,
    roleOptions,
    search,
    statusFilter,
    createOperator,
    deactivateUser,
    reactivateUser,
    resetUserPassword,
    setSearch,
    setRoleFilter,
    setStatusFilter,
  }
}
