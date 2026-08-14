import { useReducer, useMemo } from 'react'
import {
  getProcessoPadrao,
  getApenadoOriginal,
  trackFieldChange,
  resetMudancas,
} from '@/features/atendimento/model/atendimentoUtils'
import { AtendimentoContext } from '@/features/atendimento/context/atendimentoContext'

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
  reciboGerado: null,
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
        return state
      }

      if (!state.apenado) {
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
      if (state.fotoAtendimento.isStreaming === action.payload) return state
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

    case 'SET_RECIBO_GERADO': {
      return {
        ...state,
        reciboGerado: action.payload,
      }
    }

    case 'SET_ERROR': {
      return {
        ...state,
        errorMessage: action.payload,
      }
    }

    case 'RESET_ATENDIMENTO': {
      return { ...initialState }
    }

    default:
      return state
  }
}

export function AtendimentoProvider({ children }) {
  const [state, dispatch] = useReducer(atendimentoReducer, initialState)

  const isReadyToCapture = Boolean(
    state.apenado && (state.apenado.processos?.length === 0 || state.processo)
  )

  const hasChanges = Object.values(state.mudancas).some((m) => m.mudou === true)

  const actions = useMemo(
    () => ({
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
      setReciboGerado: (recibo) => dispatch({ type: 'SET_RECIBO_GERADO', payload: recibo }),
      setError: (msg) => dispatch({ type: 'SET_ERROR', payload: msg }),
      resetAtendimento: () => dispatch({ type: 'RESET_ATENDIMENTO' }),
    }),
    []
  )

  const value = useMemo(
    () => ({
      ...state,
      isReadyToCapture,
      hasChanges,
      dispatch,
      ...actions,
    }),
    [state, isReadyToCapture, hasChanges, actions]
  )

  return <AtendimentoContext.Provider value={value}>{children}</AtendimentoContext.Provider>
}
