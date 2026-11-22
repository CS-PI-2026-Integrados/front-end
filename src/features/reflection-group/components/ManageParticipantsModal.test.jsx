import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ManageParticipantsModal } from './ManageParticipantsModal'

vi.mock('@/features/convicteds', () => ({
  useConvictedList: () => ({ items: [], isLoading: false, error: null }),
}))

const group = { id: 'group-1', name: 'Grupo MVP', status: 'ACTIVE' }

describe('ManageParticipantsModal', () => {
  it('shows a lookup failure and retry action instead of presenting it as an empty result', () => {
    const onRetry = vi.fn()
    render(
      <ManageParticipantsModal
        open
        group={group}
        participants={[]}
        error="API indisponível."
        onRetry={onRetry}
        onOpenChange={vi.fn()}
      />
    )

    expect(screen.getByRole('alert').textContent).toContain('API indisponível.')
    expect(screen.queryByText('Nenhum participante selecionado.')).toBeNull()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })

  it('renders empty groups clearly and keeps saving disabled when there are no changes', () => {
    render(
      <ManageParticipantsModal
        open
        group={group}
        participants={[]}
        additions={[]}
        removals={[]}
        onOpenChange={vi.fn()}
        onSave={vi.fn()}
      />
    )

    expect(screen.getByText('Nenhum participante selecionado.')).toBeTruthy()
    expect(screen.getByText('Nenhuma alteração pendente.')).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Salvar alterações' }).disabled).toBe(true)
  })
})
