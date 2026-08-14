import { useState, useMemo } from 'react'
import { X, Search } from 'lucide-react'
import { Input } from '@/shared/ui/input'
import { Badge } from '@/shared/ui/badge'

const ParticipantSelector = ({
  participants,
  onParticipantsChange,
  availableParticipants,
  disabled = false,
}) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [showSuggestions, setShowSuggestions] = useState(false)

  const filteredSuggestions = useMemo(() => {
    if (!searchTerm.trim() || disabled) return []

    const term = searchTerm.toLowerCase().trim()
    return availableParticipants.filter((p) => {
      const matchNome = p.nome.toLowerCase().includes(term)
      const cleanCPF = p.cpf.replace(/\D/g, '')
      const cleanTerm = term.replace(/\D/g, '')
      const matchCPF = cleanTerm !== '' && cleanCPF.includes(cleanTerm)

      return (matchNome || matchCPF) && !participants.find((sel) => sel.id === p.id)
    })
  }, [searchTerm, availableParticipants, participants, disabled])

  const handleSelectParticipant = (participant) => {
    if (disabled) return
    if (!participants.find((p) => p.id === participant.id)) {
      onParticipantsChange([...participants, participant])
    }
    setSearchTerm('')
    setShowSuggestions(false)
  }

  const handleRemoveParticipant = (id) => {
    if (disabled) return
    onParticipantsChange(participants.filter((p) => p.id !== id))
  }

  return (
    <div className="space-y-3">
      <div className="relative">
        <div className="relative flex items-center">
          <Search className="text-muted-foreground absolute left-3 h-4 w-4" />
          <Input
            type="text"
            placeholder="Buscar por nome, CPF ou nº de processo..."
            value={searchTerm}
            onChange={(e) => {
              if (disabled) return
              setSearchTerm(e.target.value)
              setShowSuggestions(true)
            }}
            onFocus={() => !disabled && setShowSuggestions(true)}
            onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
            className="pl-10"
            disabled={disabled}
          />
        </div>

        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border bg-white shadow-lg">
            <div className="max-h-64 overflow-y-auto">
              {filteredSuggestions.map((participant) => (
                <div
                  key={participant.id}
                  onClick={() => handleSelectParticipant(participant)}
                  className="hover:bg-muted cursor-pointer border-b px-4 py-2 last:border-b-0"
                >
                  <p className="text-sm font-medium">{participant.nome}</p>
                  <p className="text-muted-foreground text-xs">{participant.cpf}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {participants.length > 0 && (
        <div className="space-y-2">
          <p className="text-muted-foreground text-sm font-medium">
            {participants.length} {participants.length === 1 ? 'participante' : 'participantes'}
          </p>
          <div className="flex flex-wrap gap-2">
            {participants.map((participant) => (
              <Badge
                key={participant.id}
                variant="outline"
                className="flex items-center gap-1 px-2 py-1"
              >
                <span className="truncate">{participant.nome}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveParticipant(participant.id)}
                  className="hover:text-foreground text-muted-foreground ml-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </Badge>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default ParticipantSelector
