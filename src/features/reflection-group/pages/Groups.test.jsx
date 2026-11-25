import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it, vi } from 'vitest'
import Groups from './Groups'

vi.mock('@/features/authentication', () => ({
  useSession: () => ({ session: { tenant: { id: 'tenant-1' }, user: { id: 'user-1' } } }),
}))

vi.mock('../hooks/useGroups', () => ({
  useGroups: () => ({
    canManage: true,
    error: null,
    isLoading: false,
    isSaving: false,
    items: [
      {
        id: 'group-1',
        name: 'Grupo MVP',
        status: 'ACTIVE',
        participantCount: 1,
        participants: [{ id: 'participant-1', fullName: 'Ana Exemplo' }],
        totalMeetingsCount: 8,
        frequency: 'WEEKLY',
      },
    ],
    totalItems: 1,
    totalPages: 1,
    reload: vi.fn(),
    mutate: vi.fn(),
  }),
}))

vi.mock('../hooks/useGroupParticipantsDraft', () => ({
  useGroupParticipantsDraft: () => ({
    participants: [{ id: 'participant-1', fullName: 'Ana Exemplo' }],
    additions: [],
    removals: [],
    isLoading: false,
    isSaving: false,
    error: null,
    saveError: null,
    groupStatus: 'ACTIVE',
    requestClose: () => true,
    add: vi.fn(),
    remove: vi.fn(),
    save: vi.fn(),
    cancel: vi.fn(),
    reload: vi.fn(),
    discardConfirmationOpen: false,
    cancelDiscard: vi.fn(),
    confirmDiscard: vi.fn(),
  }),
}))

vi.mock('../components/ManageParticipantsModal', () => ({
  ManageParticipantsModal: ({ open, group }) =>
    open ? (
      <div role="dialog" aria-label="Gerenciar participantes">
        {group.name}
      </div>
    ) : null,
}))

vi.mock('../components/NewGroupForm', () => ({ default: () => null }))

describe('Groups participant shortcut', () => {
  it('opens the shared participant flow for the selected group from the listing', () => {
    render(
      <MemoryRouter>
        <Groups />
      </MemoryRouter>
    )

    expect(screen.queryByRole('dialog', { name: 'Gerenciar participantes' })).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Participantes' }))

    expect(screen.getByRole('dialog', { name: 'Gerenciar participantes' }).textContent).toContain(
      'Grupo MVP'
    )
  })
})
