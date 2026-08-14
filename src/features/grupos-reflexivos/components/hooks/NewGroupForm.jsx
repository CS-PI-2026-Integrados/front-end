import { useState } from 'react'
import { Button } from '@/shared/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/shared/ui/dialog'
import { Input } from '@/shared/ui/input'
import { Label } from '@/shared/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/shared/ui/select'
import { Textarea } from '@/shared/ui/textarea'
import ParticipantSelector from './ParticipantSelector'

const dayOfWeekMap = {
  'Segunda-feira': 1,
  'Terça-feira': 2,
  'Quarta-feira': 3,
  'Quinta-feira': 4,
  'Sexta-feira': 5,
  Sábado: 6,
  Domingo: 0,
}

const generateEncontros = (dataInicio, totalEncontros, diaSemana, frequencia) => {
  const startDate = new Date(dataInicio)
  const targetDayOfWeek = dayOfWeekMap[diaSemana]

  // Find the first date that matches the selected day of week
  let firstEncontroDate = new Date(startDate)
  const currentDayOfWeek = firstEncontroDate.getDay()
  const daysToAdd = (targetDayOfWeek - currentDayOfWeek + 7) % 7

  if (daysToAdd > 0) {
    firstEncontroDate.setDate(firstEncontroDate.getDate() + daysToAdd)
  }

  // Calculate the interval in days based on frequency
  const frequencyMap = {
    Semanal: 7,
    Quinzenal: 14,
    Mensal: 30,
  }

  const interval = frequencyMap[frequencia] || 7

  const encontros = []

  for (let i = 0; i < totalEncontros; i++) {
    const encontroDate = new Date(firstEncontroDate)
    encontroDate.setDate(encontroDate.getDate() + i * interval)

    const encuentro = {
      id: i + 1,
      data: encontroDate.toISOString().split('T')[0],
      tema: `Encontro ${i + 1}`,
      presentes: [],
      ausentes: [],
      justificacoes: {},
      situacao: 'PENDENTE',
    }

    encontros.push(encuentro)
  }

  return encontros
}

const NewGroupForm = ({ isOpen, onOpenChange, availableParticipants, onSubmit }) => {
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    dataInicio: '',
    totalEncontros: 8,
    frequencia: 'Semanal',
    diaSemana: '',
    horario: '',
    minimoEncontros: 6,
    participantes: [],
  })

  const [errors, setErrors] = useState({})

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleSelectChange = (name, value) => {
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: '',
      }))
    }
  }

  const handleParticipantsChange = (participants) => {
    setFormData((prev) => ({
      ...prev,
      participantes: participants,
    }))
    if (errors.participantes) {
      setErrors((prev) => ({
        ...prev,
        participantes: '',
      }))
    }
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.nome.trim()) {
      newErrors.nome = 'Nome do grupo é obrigatório'
    }

    if (!formData.descricao.trim()) {
      newErrors.descricao = 'Descrição é obrigatória'
    }

    if (!formData.dataInicio) {
      newErrors.dataInicio = 'Data de início é obrigatória'
    }

    if (!formData.diaSemana) {
      newErrors.diaSemana = 'Selecione o dia da semana'
    }
    if (!formData.horario) {
      newErrors.horario = 'Horário é obrigatório'
    }

    if (formData.totalEncontros < 1) {
      newErrors.totalEncontros = 'Total de encontros deve ser maior que 0'
    }

    if (formData.minimoEncontros < 1) {
      newErrors.minimoEncontros = 'Mínimo de encontros deve ser maior que 0'
    }

    if (formData.minimoEncontros > formData.totalEncontros) {
      newErrors.minimoEncontros = 'Mínimo de encontros não pode ser maior que total de encontros'
    }

    if (formData.participantes.length === 0) {
      newErrors.participantes = 'Adicione pelo menos um participante'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    try {
      // Generate encontros based on form data
      const encontros = generateEncontros(
        formData.dataInicio,
        formData.totalEncontros,
        formData.diaSemana,
        formData.frequencia
      )

      const formDataWithEncontros = {
        ...formData,
        encontros,
      }

      await onSubmit(formDataWithEncontros)
      resetForm()
    } catch {
      // The parent form owns user-facing error feedback.
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '',
      descricao: '',
      dataInicio: '',
      totalEncontros: 8,
      frequencia: 'Semanal',
      diaSemana: '',
      horario: '',
      minimoEncontros: 6,
      participantes: [],
    })
    setErrors({})
    onOpenChange(false)
  }

  const handleCancel = () => {
    resetForm()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Novo grupo reflexivo</DialogTitle>
          <DialogDescription>Preencha os dados do novo grupo reflexivo</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nome">Nome do grupo</Label>
            <Input
              id="nome"
              name="nome"
              placeholder="Ex: Grupo Reflexivo - Responsabilidade Social"
              value={formData.nome}
              onChange={handleInputChange}
              aria-invalid={!!errors.nome}
            />
            {errors.nome && <p className="text-xs text-red-500">{errors.nome}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="descricao">Descrição</Label>
            <Textarea
              id="descricao"
              name="descricao"
              placeholder="Descreva o objetivo e o foco do grupo"
              value={formData.descricao}
              onChange={handleInputChange}
              className="resize-none"
              aria-invalid={!!errors.descricao}
            />
            {errors.descricao && <p className="text-xs text-red-500">{errors.descricao}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dataInicio">Data de início</Label>
              <Input
                id="dataInicio"
                name="dataInicio"
                type="date"
                value={formData.dataInicio}
                onChange={handleInputChange}
                aria-invalid={!!errors.dataInicio}
              />
              {errors.dataInicio && <p className="text-xs text-red-500">{errors.dataInicio}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="dataTermino">Data prevista de término</Label>
              <Input
                id="dataTermino"
                name="dataTermino"
                type="date"
                value={formData.dataTermino}
                onChange={handleInputChange}
                aria-invalid={!!errors.dataTermino}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="totalEncontros">Total de encontros planejados</Label>
              <Input
                id="totalEncontros"
                name="totalEncontros"
                type="number"
                min="1"
                value={formData.totalEncontros}
                onChange={handleInputChange}
                aria-invalid={!!errors.totalEncontros}
                className="w-full"
              />
              {errors.totalEncontros && (
                <p className="text-xs text-red-500">{errors.totalEncontros}</p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="minimoEncontros">Mínimo de encontros para conclusão</Label>
              <Input
                id="minimoEncontros"
                name="minimoEncontros"
                type="number"
                min="1"
                value={formData.minimoEncontros}
                onChange={handleInputChange}
                aria-invalid={!!errors.minimoEncontros}
                className="w-full"
              />
              {errors.minimoEncontros && (
                <p className="text-xs text-red-500">{errors.minimoEncontros}</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="frequencia">Frequência dos encontros</Label>
            <Select
              value={formData.frequencia}
              onValueChange={(value) => handleSelectChange('frequencia', value)}
            >
              <SelectTrigger id="frequencia" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Semanal">Semanal</SelectItem>
                <SelectItem value="Quinzenal">Quinzenal</SelectItem>
                <SelectItem value="Mensal">Mensal</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="diaSemana">Dia da semana</Label>
              <Select
                value={formData.diaSemana}
                onValueChange={(value) => handleSelectChange('diaSemana', value)}
              >
                <SelectTrigger id="diaSemana" className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Segunda-feira">Segunda-feira</SelectItem>
                  <SelectItem value="Terça-feira">Terça-feira</SelectItem>
                  <SelectItem value="Quarta-feira">Quarta-feira</SelectItem>
                  <SelectItem value="Quinta-feira">Quinta-feira</SelectItem>
                  <SelectItem value="Sexta-feira">Sexta-feira</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                  <SelectItem value="Domingo">Domingo</SelectItem>
                </SelectContent>
              </Select>
              {errors.diaSemana && <p className="text-xs text-red-500">{errors.diaSemana}</p>}
            </div>

            <div className="space-y-2">
              <Label htmlFor="horario">Horário</Label>
              <Input
                id="horario"
                name="horario"
                type="time"
                value={formData.horario}
                onChange={handleInputChange}
                aria-invalid={!!errors.horario}
                className="w-full"
              />
              {errors.horario && <p className="text-xs text-red-500">{errors.horario}</p>}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Participantes</Label>
            <ParticipantSelector
              participants={formData.participantes}
              onParticipantsChange={handleParticipantsChange}
              availableParticipants={availableParticipants}
            />
            {errors.participantes && <p className="text-xs text-red-500">{errors.participantes}</p>}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancelar
            </Button>
            <Button type="submit">Criar Grupo</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export default NewGroupForm
