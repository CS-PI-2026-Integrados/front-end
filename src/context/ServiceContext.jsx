import React, { createContext, useContext, useReducer } from 'react'
import {
  getProcessoPadrao,
  getApenadoOriginal,
  trackFieldChange,
  resetMudancas,
} from '@/lib/atendimentoUtils'

const ServiceContext = createContext()

/**
 * Estado inicial do atendimento
 * Estrutura unificada com todas as ações relacionadas
 */
const initialState = {
  // Dados do atendimento
  apenado: null,
  processo: null,
  canEdit: false,
  mudancas: {},

  // Foto
  fotoAtendimento: null,

  // Estados de submissão
  isSubmitting: false,
  isSuccess: false,
  errorMessage: '',
}

/**
 * Reducer que orquestra todas as ações de atendimento
 * Cada action garante consistência do estado
 */
function atendimentoReducer(state, action) {
  switch (action.type) {
    case 'SELECT_APENADO': {
      const apenado = action.payload
      const processo = getProcessoPadrao(apenado?.processos)

      return {
        ...state,
        apenado,
        processo,
        canEdit: false, // Reseta edição ao trocar apenado
        mudancas: resetMudancas(), // Limpa mudanças anteriores
        errorMessage: '', // Limpa erro anterior
      }
    }

    case 'SELECT_PROCESSO': {
      const processo = action.payload

      // Validação: só seleciona processo se houver apenado
      if (!state.apenado) {
        console.warn('Tentativa de selecionar processo sem apenado')
        return state
      }

      return {
        ...state,
        processo,
      }
    }

    case 'UPDATE_FIELD': {
      const { field, value } = action.payload

      // Validação: só atualiza se estiver em modo edição
      if (!state.canEdit) {
        console.warn('Tentativa de editar sem canEdit=true')
        return state
      }

      if (!state.apenado) {
        console.warn('Tentativa de atualizar campo sem apenado selecionado')
        return state
      }

      // Rastreia a mudança
      const original = getApenadoOriginal(state.apenado)[field]
      const mudanca = trackFieldChange(original, value, field)

      return {
        ...state,
        apenado: {
          ...state.apenado,
          [field]: value,
        },
        mudancas: {
          ...state.mudancas,
          [field]: mudanca,
        },
      }
    }

    case 'TOGGLE_EDIT': {
      const novoCanEdit = !state.canEdit

      // Se desabilitando edição, pode resetar mudanças se configurado
      if (!novoCanEdit) {
        return {
          ...state,
          canEdit: novoCanEdit,
          mudancas: resetMudancas(), // Descarta mudanças ao desabilitar
        }
      }

      return {
        ...state,
        canEdit: novoCanEdit,
      }
    }

    case 'SET_FOTO': {
      const fotoAtendimento = action.payload

      return {
        ...state,
        fotoAtendimento,
      }
    }

    case 'SET_SUBMITTING': {
      return {
        ...state,
        isSubmitting: action.payload,
      }
    }

    case 'SET_SUCCESS': {
      return {
        ...state,
        isSuccess: action.payload,
      }
    }

    case 'SET_ERROR': {
      return {
        ...state,
        errorMessage: action.payload,
      }
    }

    case 'RESET_ATENDIMENTO': {
      return initialState
    }

    default:
      return state
  }
}

export const ServiceProvider = ({ children }) => {
  const [state, dispatch] = useReducer(atendimentoReducer, initialState)

  // Computed value: isReadyToCapture
  const isReadyToCapture = Boolean(
    state.apenado && (state.apenado.processos?.length === 0 || state.processo)
  )

  // Computed value: hasChanges
  const hasChanges = Object.values(state.mudancas).some((m) => m.mudou === true)

  const value = {
    // State
    ...state,

    // Computed values
    isReadyToCapture,
    hasChanges,

    // Dispatcher
    dispatch,

    // Convenience actions (shortcuts)
    selectApenado: (apenado) => dispatch({ type: 'SELECT_APENADO', payload: apenado }),
    selectProcesso: (processo) => dispatch({ type: 'SELECT_PROCESSO', payload: processo }),
    updateField: (field, value) => dispatch({ type: 'UPDATE_FIELD', payload: { field, value } }),
    toggleEdit: () => dispatch({ type: 'TOGGLE_EDIT' }),
    setFoto: (foto) => dispatch({ type: 'SET_FOTO', payload: foto }),
    setSubmitting: (bool) => dispatch({ type: 'SET_SUBMITTING', payload: bool }),
    setSuccess: (bool) => dispatch({ type: 'SET_SUCCESS', payload: bool }),
    setError: (msg) => dispatch({ type: 'SET_ERROR', payload: msg }),
    resetAtendimento: () => dispatch({ type: 'RESET_ATENDIMENTO' }),
  }

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>
}

export const useService = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('useService deve ser usado dentro de um ServiceProvider')
  }
  return context
}
