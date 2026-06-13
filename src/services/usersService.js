import { createUserPasswordResetToken } from '@/repositories/auth/passwordResetRepository.mock'
import {
  createUser,
  findUserByCpf,
  findUserByEmail,
  findUserById,
  listUsersByTenant,
  updateUserStatus,
} from '@/repositories/users/usersRepository.mock'
import { sendPasswordResetEmail } from '@/services/authEmailService.mock'
import { registerUserAuditAction } from '@/services/auditService'
import {
  SESSION_STATUS,
  USER_ROLES,
  USER_STATUS,
  canAccessUsersPage,
  canDeactivateUser,
  canReactivateUser,
  canResetUserPassword,
} from '@/lib/roles'
import { formatCpf, validateCPF } from '@/lib/validadorCpf'

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

  if (!name || !cpf || !email) {
    throw new Error('Preencha todos os campos obrigatórios.')
  }

  if (!validateCPF(cpf)) {
    throw new Error('CPF inválido.')
  }

  const existingCpfUser = await findUserByCpf(cpf)

  if (existingCpfUser) {
    throw new Error('CPF já cadastrado.')
  }

  const existingEmailUser = await findUserByEmail(email)

  if (existingEmailUser) {
    throw new Error('E-mail já cadastrado.')
  }

  const createdUser = await createUser({
    tenantId: actor.tenantId,
    name,
    cpf,
    email,
    role: USER_ROLES.OPERATOR,
    status: USER_STATUS.ACTIVE,
    sessionStatus: SESSION_STATUS.INACTIVE,
    password: crypto.randomUUID(),
  })

  await registerUserAuditAction({
    action: 'user.created',
    actor,
    target: createdUser,
  })

  const resetRequest = await createUserPasswordResetToken(cpf)

  if (resetRequest) {
    await sendPasswordResetEmail(resetRequest.email, resetRequest.token)
  }

  return createdUser
}

export const deactivateTenantUser = async ({ session, targetUserId }) => {
  const actor = getActorFromSession(session)
  const target = await getTargetUser(targetUserId)

  if (!canDeactivateUser(actor, target)) {
    throw new Error('Usuário sem permissão para desativar esta conta.')
  }

  const updatedTarget = await updateUserStatus({
    userId: targetUserId,
    status: USER_STATUS.INACTIVE,
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

  const updatedTarget = await updateUserStatus({
    userId: targetUserId,
    status: USER_STATUS.ACTIVE,
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
