import { useState } from 'react'
import ParticipantSelector from '@/components/hooks/ParticipantSelector'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

const GroupEditModal = ({ group, isOpen, onOpenChange, availableParticipants, onUpdate }) => {
  const [editData, setEditData] = useState(
    group ?? { nomeGrupo: '', descricao: '', participantes: [] }
  )
  const isEditable = group?.status === 'ANDAMENTO' || group?.status === 'PLANEJAMENTO'

  const handleOpenChange = (open) => {
    if (open && group) {
      setEditData(group)
    }

    onOpenChange(open)
  }
  const handleInputChange = (e) => {
    const { name, value } = e.target
    setEditData((prev) => ({ ...prev, [name]: value }))
  }

  const handleParticipantsChange = (participants) => {
    setEditData((prev) => ({ ...prev, participantes: participants }))
  }

  const handleSave = () => {
    if (!group) return
    onUpdate({ ...group, ...editData })
    onOpenChange(false)
  }

  if (!group) return null

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle>Detalhes do grupo reflexivo</DialogTitle>
          <DialogDescription>
            Visualize e edite apenas nome, descrição e participantes.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="nomeGrupo">Nome do grupo</Label>
            <Input
              id="nomeGrupo"
              name="nomeGrupo"
              value={editData.nomeGrupo}
              onChange={handleInputChange}
              disabled={!isEditable}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              value={editData.descricao}
              onChange={handleInputChange}
              disabled={!isEditable}
              className="resize-none"
            />
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <ParticipantSelector
              participants={editData.participantes}
              onParticipantsChange={handleParticipantsChange}
              availableParticipants={availableParticipants}
              disabled={!isEditable}
            />
          </div>

          {isEditable ? (
            <span></span>
          ) : (
            <div className="rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
              <p>O status atual do grupo não permite a alteração .</p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Fechar
          </Button>
          <Button type="button" onClick={handleSave} disabled={!isEditable}>
            Salvar alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default GroupEditModal
