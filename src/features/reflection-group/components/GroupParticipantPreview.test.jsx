import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { GroupParticipantPreview } from './GroupParticipantPreview'

describe('GroupParticipantPreview', () => {
  it('shows up to three participant initials and the remaining count accessibly', () => {
    render(
      <GroupParticipantPreview
        participantCount={4}
        participants={[
          { id: '1', fullName: 'Ana Beatriz' },
          { id: '2', fullName: 'Bruno Costa' },
          { id: '3', fullName: 'Carla Dias' },
          { id: '4', fullName: 'Daniel Esteves' },
        ]}
      />
    )

    expect(
      screen.getByRole('img', {
        name: 'Participantes: Ana Beatriz, Bruno Costa, Carla Dias e mais 1 participante',
      })
    ).toBeTruthy()
    expect(screen.getByText('+1')).toBeTruthy()
  })

  it('has a useful fallback when the API reports participants without preview names', () => {
    render(<GroupParticipantPreview participantCount={3} participants={[]} />)

    expect(screen.getByText('Iniciais indisponíveis')).toBeTruthy()
  })
})
