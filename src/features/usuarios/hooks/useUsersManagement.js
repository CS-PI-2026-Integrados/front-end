import { useCallback, useEffect, useMemo, useState } from 'react'
import toast from 'react-hot-toast'
import { useSession } from '@/features/autenticacao/context/sessionContext'
import {
  createTenantOperator,
  deactivateTenantUser,
  listManageableTenantUsers,
  reactivateTenantUser,
  resetTenantUserPassword,
} from '@/features/usuarios/services/usersService'
import { normalizeSearch } from '@/features/usuarios/model/userFormatters'

export const USERS_STATUS_FILTERS = {
  ALL: 'all',
  ACTIVE: 'active',
  INACTIVE: 'inactive',
}

const SUCCESS_MESSAGE = 'Alteração feita com sucesso'
const CREATE_SUCCESS_MESSAGE = 'Operador cadastrado com sucesso.'
const ERROR_MESSAGE = 'Houve um erro ao completar essa ação'

export function useUsersManagement() {
  const { session } = useSession()
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')
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

    return users
      .filter((user) => {
        const matchesStatus =
          statusFilter === USERS_STATUS_FILTERS.ALL ||
          (statusFilter === USERS_STATUS_FILTERS.ACTIVE && user.isActive) ||
          (statusFilter === USERS_STATUS_FILTERS.INACTIVE && !user.isActive)
        const matchesRole = roleFilter === 'all' || user.roleId === roleFilter

        if (!matchesStatus || !matchesRole) return false

        if (!normalizedSearch && !searchDigits) return true

        const normalizedName = normalizeSearch(user.name)
        const cpfDigits = user.cpf.replace(/\D/g, '')
        const matchesName = normalizedSearch ? normalizedName.includes(normalizedSearch) : false
        const matchesCpf = searchDigits ? cpfDigits.includes(searchDigits) : false

        return matchesName || matchesCpf
      })
      .sort((firstUser, secondUser) => {
        return firstUser.name.localeCompare(secondUser.name, 'pt-BR', { sensitivity: 'base' })
      })
  }, [roleFilter, search, statusFilter, users])

  const roleOptions = useMemo(() => {
    const rolesById = new Map()

    users.forEach((user) => {
      if (user.role) {
        rolesById.set(user.role.id, user.role)
      }
    })

    return Array.from(rolesById.values()).sort((firstRole, secondRole) => {
      return secondRole.level - firstRole.level
    })
  }, [users])

  const metrics = useMemo(() => {
    const activeUsers = users.filter((user) => user.isActive)
    const inactiveUsers = users.filter((user) => !user.isActive)

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
    async (operatorData) => {
      const createdUser = await createTenantOperator({
        session,
        operatorData,
      })

      setUsers((currentUsers) => [...currentUsers, createdUser])
      toast.success(CREATE_SUCCESS_MESSAGE)

      return createdUser
    },
    [session]
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
    async (user) => {
      try {
        const result = await resetTenantUserPassword({
          session,
          targetUserId: user.id,
        })

        setUsers((currentUsers) => {
          return currentUsers.map((currentUser) => {
            return currentUser.id === result.user.id ? result.user : currentUser
          })
        })
        toast.success('Senha temporária gerada com sucesso.')

        return result.temporaryPassword
      } catch {
        toast.error(ERROR_MESSAGE)
        throw new Error(ERROR_MESSAGE)
      }
    },
    [session]
  )

  return {
    currentUser: session?.user,
    filteredUsers,
    isLoading,
    metrics,
    roleFilter,
    roleOptions,
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
    setRoleFilter,
    setStatusFilter,
  }
}
