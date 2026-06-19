import { createUserPasswordResetToken } from '@/repositories/auth/passwordResetRepository.mock'
import { findRoleByKey } from '@/repositories/roles/rolesRepository.mock'
import {
  createUser,
  findUserByTenantAndCpf,
  findUserByEmail,
  findUserById,
  listUsersByTenant,
  updateUserActiveState,
} from '@/repositories/users/usersRepository.mock'
import { enviarEmailRecuperacao, sendPasswordResetEmail } from '@/services/authEmailService.mock'
import { registerUserAuditAction } from '@/services/auditService'
import {
  ROLE_KEYS,
  canAccessUsersPage,
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
  isRoleAbove,
} from '@/lib/userPermissions'
import { formatCpf, validateCPF } from '@/lib/validadorCpf'

const CREATABLE_ROLE_KEYS = [ROLE_KEYS.OPERATOR, ROLE_KEYS.ADMIN]

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

const getCreatableRole = async ({ actor, roleKey }) => {
  if (!CREATABLE_ROLE_KEYS.includes(roleKey)) {
    throw new Error('Nível de acesso inválido.')
  }

  const role = await findRoleByKey(roleKey)

  if (!role) {
    throw new Error('Cargo não encontrado.')
  }

  if (!isRoleAbove(actor.role, role)) {
    throw new Error('Usuário sem permissão para cadastrar este nível de acesso.')
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
  const password = operatorData.password || ''
  const roleKey = operatorData.roleKey || ROLE_KEYS.OPERATOR

  if (!name || !cpf || !email || !password) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  if (!validateCPF(cpf)) {
    throw new Error('CPF inválido.')
  }

  const existingCpfUser = await findUserByTenantAndCpf({
    tenantId: actor.tenantId,
    cpf,
  })

  if (existingCpfUser) {
    throw new Error('CPF já cadastrado na comarca.')
  }

  const existingEmailUser = await findUserByEmail(email)

  if (existingEmailUser) {
    throw new Error('E-mail já cadastrado.')
  }

  const role = await getCreatableRole({ actor, roleKey })

  const createdUser = await createUser({
    tenantId: actor.tenantId,
    name,
    cpf,
    email,
    roleId: role.id,
    isActive: true,
    hasActiveSession: false,
    password,
  })

  await registerUserAuditAction({
    action: 'user.created',
    actor,
    target: createdUser,
  })

  await enviarEmailRecuperacao(email)

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

export const requestTenantUserPasswordReset = async ({ session, targetUserId }) => {
  const actor = getActorFromSession(session)
  const target = await getTargetUser(targetUserId)

  if (!canResetUserPassword(actor, target)) {
    throw new Error('Usuário sem permissão para redefinir a senha desta conta.')
  }

  const resetRequest = await createUserPasswordResetToken(target.cpf)

  if (!resetRequest) {
    throw new Error('Não foi possível gerar o link de recuperação.')
  }

  await sendPasswordResetEmail(resetRequest.email, resetRequest.token)
  await registerUserAuditAction({
    action: 'user.password_reset_requested',
    actor,
    target,
  })

  return resetRequest
}
