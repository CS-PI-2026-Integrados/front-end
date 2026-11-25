import { fireEvent, render, screen, within } from '@testing-library/react'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'
import GroupConversation from './GroupConversation'

vi.mock('@/features/authentication', () => ({
  useSession: () => ({ session: { user: { role: { key: 'operator' } } } }),
}))

vi.mock('@/shared/components/buttons/BackButton', () => ({
  BackButton: () => null,
}))

vi.mock('./ManageParticipantsModal', () => ({
  ManageParticipantsModal: ({ open, group, onOpenChange }) =>
    open ? (
      <div role="dialog" aria-label="Gerenciar participantes">
        {group.name}
        <button onClick={() => onOpenChange(false)}>Fechar</button>
      </div>
    ) : null,
}))

const makeData = (isOpen, setOpen) => ({
  isLoading: false,
  isSavingMeeting: false,
  group: {
    id: 'group-1',
    name: 'Grupo MVP',
    description: 'Grupo de teste',
    status: 'ACTIVE',
    minimumMeetings: 2,
    participants: [{ id: 'participant-1', fullName: 'Ana Exemplo' }],
    meetings: [],
  },
  isParticipantsModalOpen: isOpen,
  openParticipantsModal: () => setOpen(true),
  setParticipantsModalOpen: setOpen,
  requestCloseParticipants: vi.fn(),
  saveParticipants: vi.fn(),
  confirmDiscardParticipants: vi.fn(),
  cancelDiscardParticipants: vi.fn(),
  participantDraft: {
    participants: [{ id: 'participant-1', fullName: 'Ana Exemplo' }],
    additions: [],
    removals: [],
    isLoading: false,
    isSaving: false,
    error: null,
    saveError: null,
    groupStatus: 'ACTIVE',
    add: vi.fn(),
    remove: vi.fn(),
    cancel: vi.fn(),
    reload: vi.fn(),
    discardConfirmationOpen: false,
  },
  canManageParticipants: true,
  isModalOpen: false,
  setIsModalOpen: vi.fn(),
  selectedEncontro: null,
  encontroNewStatus: null,
  setEncontroNewStatus: vi.fn(),
  participantStatuses: {},
  justifications: {},
  isConfirmed: false,
  setIsConfirmed: vi.fn(),
  isEditEncontroOpen: false,
  setIsEditEncontroOpen: vi.fn(),
  editEncontroData: '',
  setEditEncontroData: vi.fn(),
  editEncontroTema: '',
  setEditEncontroTema: vi.fn(),
  isNewEncontroModalOpen: false,
  setIsNewEncontroModalOpen: vi.fn(),
  newEncontroData: '',
  setNewEncontroData: vi.fn(),
  newEncontroTema: '',
  setNewEncontroTema: vi.fn(),
  justificationTypes: {},
  formatDate: vi.fn(() => ''),
  getParticipantPresencas: vi.fn(() => 0),
  getParticipantFaltas: vi.fn(() => 0),
  getParticipantElegibilidade: vi.fn(() => 2),
  getRealizedEncontros: vi.fn(() => 0),
  getTotalEncontrosNotCanceled: vi.fn(() => 0),
  getUnjustifiedAbsentees: vi.fn(() => []),
  getEligibleParticipants: vi.fn(() => []),
  isEncontroAtrasado: vi.fn(() => false),
  openNewEncontroModal: vi.fn(),
  closeNewEncontroModal: vi.fn(),
  handleCreateEncontro: vi.fn(),
  handleEditEncontro: vi.fn(),
  handleSaveEditEncontro: vi.fn(),
  openPresenceModal: vi.fn(),
  closePresenceModal: vi.fn(),
  handleParticipantStatusChange: vi.fn(),
  handleJustificationChange: vi.fn(),
  handleJustificationTypeChange: vi.fn(),
  isConfirmDisabled: vi.fn(() => true),
  handleConfirmPresences: vi.fn(),
  error: null,
  reload: vi.fn(),
})

describe('GroupConversation participant shortcuts', () => {
  it('opens the same participant flow from the details header and Participants section', () => {
    const TestPage = () => {
      const [isOpen, setOpen] = useState(false)
      return <GroupConversation data={makeData(isOpen, setOpen)} />
    }

    render(<TestPage />)

    expect(screen.queryByRole('dialog', { name: 'Gerenciar participantes' })).toBeNull()
    fireEvent.click(
      screen.getByRole('button', { name: 'Gerenciar participantes do grupo Grupo MVP' })
    )
    expect(screen.getByRole('dialog', { name: 'Gerenciar participantes' }).textContent).toContain(
      'Grupo MVP'
    )
    fireEvent.click(screen.getByRole('button', { name: 'Fechar' }))

    const participantsTab = screen.getByRole('tab', { name: 'Participantes' })
    fireEvent.mouseDown(participantsTab, { button: 0, ctrlKey: false })
    const participantsPanel = screen.getByRole('tabpanel')
    fireEvent.click(
      within(participantsPanel).getByRole('button', {
        name: 'Gerenciar participantes do grupo Grupo MVP',
      })
    )
    expect(screen.getByRole('dialog', { name: 'Gerenciar participantes' }).textContent).toContain(
      'Grupo MVP'
    )
  })
})
