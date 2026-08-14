import { findRoleByKey } from '@/repositories/roles/rolesRepository.mock'
import {
  createUser,
  findUserByTenantAndCpf,
  findUserByEmail,
  findUserById,
  listUsersByTenant,
  updateUserActiveState,
  updateUserPassword,
} from '@/repositories/users/usersRepository.mock'
import { sendWelcomeEmail } from '@/services/authEmailService.mock'
import { registerUserAuditAction } from '@/services/auditService'
import {
  ROLE_KEYS,
  canAccessUsersPage,
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
} from '@/features/usuarios/model/userPermissions'
import { formatCpf, validateCPF } from '@/shared/lib/cpf'

const getActorFromSession = (session) => {
  if (!session?.user || !session?.tenant) {
    throw new Error('Sessão inválida.')
  }

  return session.user
}

const ensureUsersPageAccess = (actor) => {
  if (!canAccessUsersPage(actor)) {
    throw new Error('Usuário sem permissão para gerenciar acessos.')
  }
}

const getTargetUser = async (targetUserId) => {
  const targetUser = await findUserById(targetUserId)

  if (!targetUser) {
    throw new Error('Usuário não encontrado.')
  }

  return targetUser
}

const createFormError = (field, message) => {
  return Object.assign(new Error(message), { field })
}

const generateTemporaryPassword = () => {
  const randomValue = crypto.getRandomValues(new Uint32Array(1))[0] % 10000

  return `Comarca@${String(randomValue).padStart(4, '0')}`
}

const getCreatableRole = async (roleKey) => {
  if (![ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN].includes(roleKey)) {
    throw createFormError('roleKey', 'Nível de acesso inválido.')
  }

  const role = await findRoleByKey(roleKey)

  if (!role) {
    throw createFormError('roleKey', 'Cargo não encontrado.')
  }

  return role
}

export const listManageableTenantUsers = async (session) => {
  const actor = getActorFromSession(session)

  ensureUsersPageAccess(actor)

  return listUsersByTenant(actor.tenantId)
}

export const createTenantOperator = async ({ session, operatorData }) => {
  const actor = getActorFromSession(session)

  ensureUsersPageAccess(actor)

  const name = operatorData.name?.trim()
  const cpf = formatCpf(operatorData.cpf || '')
  const email = operatorData.email?.trim().toLowerCase()
  const roleKey = operatorData.roleKey || ROLE_KEYS.OPERATOR

  if (!name || !cpf || !email) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  if (!validateCPF(cpf)) {
    throw createFormError('cpf', 'CPF inválido.')
  }

  const existingCpfUser = await findUserByTenantAndCpf({
    tenantId: actor.tenantId,
    cpf,
  })

  if (existingCpfUser) {
    throw createFormError('cpf', 'CPF já cadastrado na comarca.')
  }

  const existingEmailUser = await findUserByEmail(email)

  if (existingEmailUser) {
    throw createFormError('email', 'E-mail já cadastrado.')
  }

  const role = await getCreatableRole(roleKey)
  const temporaryPassword = generateTemporaryPassword()

  const createdUser = await createUser({
    tenantId: actor.tenantId,
    name,
    cpf,
    email,
    roleId: role.id,
    isActive: true,
    password: temporaryPassword,
    mustChangePassword: true,
  })

  await registerUserAuditAction({
    action: 'user.created',
    actor,
    target: createdUser,
  })

  await sendWelcomeEmail(email, temporaryPassword)

  return createdUser
}

export const deactivateTenantUser = async ({ session, targetUserId }) => {
  const actor = getActorFromSession(session)
  const target = await getTargetUser(targetUserId)

  if (!canDeactivateUser(actor, target)) {
    throw new Error('Usuário sem permissão para desativar esta conta.')
  }

  const updatedTarget = await updateUserActiveState({
    userId: targetUserId,
    isActive: false,
  })

  await registerUserAuditAction({
    action: 'user.deactivated',
    actor,
    target: updatedTarget,
  })

  return updatedTarget
}

export const reactivateTenantUser = async ({ session, targetUserId }) => {
  const actor = getActorFromSession(session)
  const target = await getTargetUser(targetUserId)

  if (!canReactivateUser(actor, target)) {
    throw new Error('Usuário sem permissão para reativar esta conta.')
  }

  const updatedTarget = await updateUserActiveState({
    userId: targetUserId,
    isActive: true,
  })

  await registerUserAuditAction({
    action: 'user.reactivated',
    actor,
    target: updatedTarget,
  })

  return updatedTarget
}

export const resetTenantUserPassword = async ({ session, targetUserId }) => {
  const actor = getActorFromSession(session)
  const target = await getTargetUser(targetUserId)

  if (!canResetUserPassword(actor, target)) {
    throw new Error('Usuário sem permissão para redefinir a senha desta conta.')
  }

  const temporaryPassword = generateTemporaryPassword()
  const updatedTarget = await updateUserPassword({
    userId: target.id,
    password: temporaryPassword,
    mustChangePassword: true,
  })

  await registerUserAuditAction({
    action: 'user.temporary_password_generated',
    actor,
    target: updatedTarget,
  })

  return {
    temporaryPassword,
    user: updatedTarget,
  }
}
