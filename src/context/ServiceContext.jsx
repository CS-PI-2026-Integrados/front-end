import React, { createContext, useContext, useReducer } from 'react'
import {
  getProcessoPadrao,
  getApenadoOriginal,
  trackFieldChange,
  resetMudancas,
} from '@/lib/atendimentoUtils'

const ServiceContext = createContext()

const initialState = {
  apenado: null,
  processo: null,
  canEdit: false,
  mudancas: {},

  fotoAtendimento: {
    data: null,
    isStreaming: false,
    error: null,
  },

  isSubmitting: false,
  isSuccess: false,
  errorMessage: '',
}

function atendimentoReducer(state, action) {
  switch (action.type) {
    case 'SELECT_APENADO': {
      const apenado = action.payload
      const processo = getProcessoPadrao(apenado?.processos)

      return {
        ...state,
        apenado,
        processo,
        canEdit: false,
        mudancas: resetMudancas(),
        errorMessage: '',
      }
    }

    case 'SELECT_PROCESSO': {
      const processo = action.payload

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

      if (!state.canEdit) {
        console.warn('Tentativa de editar sem canEdit=true')
        return state
      }

      if (!state.apenado) {
        console.warn('Tentativa de atualizar campo sem apenado selecionado')
        return state
      }

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

      if (!novoCanEdit) {
        return {
          ...state,
          canEdit: novoCanEdit,
          mudancas: resetMudancas(),
        }
      }

      return {
        ...state,
        canEdit: novoCanEdit,
      }
    }

    case 'SET_FOTO': {
      const data = action.payload

      return {
        ...state,
        fotoAtendimento: {
          ...state.fotoAtendimento,
          data,
          error: null,
        },
      }
    }

    case 'SET_PHOTO_STREAMING': {
      return {
        ...state,
        fotoAtendimento: {
          ...state.fotoAtendimento,
          isStreaming: action.payload,
        },
      }
    }

    case 'SET_PHOTO_ERROR': {
      return {
        ...state,
        fotoAtendimento: {
          ...state.fotoAtendimento,
          error: action.payload,
        },
      }
    }

    case 'CLEAR_PHOTO': {
      return {
        ...state,
        fotoAtendimento: {
          data: null,
          isStreaming: false,
          error: null,
        },
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

  const isReadyToCapture = Boolean(
    state.apenado && (state.apenado.processos?.length === 0 || state.processo)
  )

  const hasChanges = Object.values(state.mudancas).some((m) => m.mudou === true)

  const value = {
    ...state,

    isReadyToCapture,
    hasChanges,

    dispatch,

    selectApenado: (apenado) => dispatch({ type: 'SELECT_APENADO', payload: apenado }),
    selectProcesso: (processo) => dispatch({ type: 'SELECT_PROCESSO', payload: processo }),
    updateField: (field, value) => dispatch({ type: 'UPDATE_FIELD', payload: { field, value } }),
    toggleEdit: () => dispatch({ type: 'TOGGLE_EDIT' }),
    setFoto: (foto) => dispatch({ type: 'SET_FOTO', payload: foto }),
    setPhotoStreaming: (bool) => dispatch({ type: 'SET_PHOTO_STREAMING', payload: bool }),
    setPhotoError: (msg) => dispatch({ type: 'SET_PHOTO_ERROR', payload: msg }),
    clearPhoto: () => dispatch({ type: 'CLEAR_PHOTO' }),
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
