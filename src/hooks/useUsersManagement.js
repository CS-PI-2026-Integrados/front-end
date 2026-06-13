import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSession } from '@/context/sessionContext'
import {
  createTenantOperator,
  deactivateTenantUser,
  listManageableTenantUsers,
  reactivateTenantUser,
  requestTenantUserPasswordReset,
} from '@/services/usersService'
import { USER_STATUS } from '@/lib/roles'
import { normalizeSearch } from '@/lib/userFormatters'

export const USERS_STATUS_FILTERS = {
  ALL: 'all',
  ACTIVE: USER_STATUS.ACTIVE,
  INACTIVE: USER_STATUS.INACTIVE,
}

const SUCCESS_MESSAGE = 'Alteração feita com sucesso'
const ERROR_MESSAGE = 'Houve um erro ao completar essa ação'

export function useUsersManagement() {
  const { session } = useSession()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState(USERS_STATUS_FILTERS.ALL)
  const [selectedUserId, setSelectedUserId] = useState(null)

  const loadUsers = useCallback(async () => {
    if (!session) return

    setIsLoading(true)

    try {
      const tenantUsers = await listManageableTenantUsers(session)

      setUsers(tenantUsers)
    } catch {
      toast.error(ERROR_MESSAGE)
    } finally {
      setIsLoading(false)
    }
  }, [session])

  useEffect(() => {
    loadUsers()
  }, [loadUsers])

  const filteredUsers = useMemo(() => {
    const normalizedSearch = normalizeSearch(search)
    const searchDigits = search.replace(/\D/g, '')

    return users.filter((user) => {
      const matchesStatus =
        statusFilter === USERS_STATUS_FILTERS.ALL || user.status === statusFilter

      if (!matchesStatus) return false

      if (!normalizedSearch && !searchDigits) return true

      const normalizedName = normalizeSearch(user.name)
      const cpfDigits = user.cpf.replace(/\D/g, '')

      return normalizedName.includes(normalizedSearch) || cpfDigits.includes(searchDigits)
    })
  }, [search, statusFilter, users])

  const metrics = useMemo(() => {
    const activeUsers = users.filter((user) => user.status === USER_STATUS.ACTIVE)
    const inactiveUsers = users.filter((user) => user.status === USER_STATUS.INACTIVE)

    return {
      total: users.length,
      active: activeUsers.length,
      inactive: inactiveUsers.length,
    }
  }, [users])

  const selectedUser = useMemo(() => {
    return users.find((user) => user.id === selectedUserId) || null
  }, [selectedUserId, users])

  const runUserAction = useCallback(
    async (action) => {
      try {
        await action()
        await loadUsers()
        toast.success(SUCCESS_MESSAGE)
      } catch {
        toast.error(ERROR_MESSAGE)
        throw new Error(ERROR_MESSAGE)
      }
    },
    [loadUsers]
  )

  const createOperator = useCallback(
    (operatorData) => {
      return runUserAction(() =>
        createTenantOperator({
          session,
          operatorData,
        })
      )
    },
    [runUserAction, session]
  )

  const deactivateUser = useCallback(
    (user) => {
      return runUserAction(() =>
        deactivateTenantUser({
          session,
          targetUserId: user.id,
        })
      )
    },
    [runUserAction, session]
  )

  const reactivateUser = useCallback(
    (user) => {
      return runUserAction(() =>
        reactivateTenantUser({
          session,
          targetUserId: user.id,
        })
      )
    },
    [runUserAction, session]
  )

  const resetUserPassword = useCallback(
    (user) => {
      return runUserAction(() =>
        requestTenantUserPasswordReset({
          session,
          targetUserId: user.id,
        })
      )
    },
    [runUserAction, session]
  )

  return {
    currentUser: session?.user,
    filteredUsers,
    isLoading,
    metrics,
    search,
    selectedUser,
    selectedUserId,
    statusFilter,
    createOperator,
    deactivateUser,
    reactivateUser,
    resetUserPassword,
    setSearch,
    setSelectedUserId,
    setStatusFilter,
  }
}
