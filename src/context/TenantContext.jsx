import { createContext, useContext, useReducer, useEffect } from 'react'
import { useSession } from '@/context/sessionContext'
import { mockTenants } from '@/mocks/tenants.mock'

const TenantContext = createContext(null)

const DEFAULT_RECEIPT_CONFIG = {
  mostrarFotoReferencia: true,
  mostrarFotoAtendimento: true,
  mostrarCpf: true,
  mostrarProcessoVara: true,
  mostrarNomeServidor: true,
  mostrarAssinaturaDigital: false,
}

const DEFAULT_RECEIPT_FIELDS = [
  { key: 'phone', label: 'Telefone', visible: true, editable: true },
  { key: 'address', label: 'Endereço', visible: true, editable: true },
  { key: 'workingStatus', label: 'Situação Trabalhista', visible: true, editable: true },
]

const initialState = {
  nomeComarca: '',
  unidade: '',
  endereco: '',
  logo: null,
  receiptConfig: { ...DEFAULT_RECEIPT_CONFIG },
  receiptFields: DEFAULT_RECEIPT_FIELDS.map((f) => ({ ...f })),
  isLoaded: false,
}

function tenantReducer(state, action) {
  switch (action.type) {
    case 'LOAD_TENANT': {
      const tenant = action.payload
      return {
        ...state,
        nomeComarca: tenant.nomeComarca || '',
        unidade: tenant.unidade || '',
        endereco: tenant.address || '',
        logo: tenant.logo || null,
        receiptConfig: tenant.receiptConfig
          ? { ...DEFAULT_RECEIPT_CONFIG, ...tenant.receiptConfig }
          : { ...DEFAULT_RECEIPT_CONFIG },
        receiptFields: tenant.receiptFields
          ? tenant.receiptFields.map((f) => ({ ...f }))
          : DEFAULT_RECEIPT_FIELDS.map((f) => ({ ...f })),
        isLoaded: true,
      }
    }

    case 'SET_UNIT_DATA':
      return {
        ...state,
        nomeComarca: action.payload.nomeComarca,
        unidade: action.payload.unidade,
        endereco: action.payload.endereco,
      }

    case 'SET_LOGO':
      return {
        ...state,
        logo: action.payload,
      }

    case 'TOGGLE_RECEIPT': {
      const field = action.payload.field
      return {
        ...state,
        receiptConfig: {
          ...state.receiptConfig,
          [field]: !state.receiptConfig[field],
        },
      }
    }

    case 'UPDATE_FIELD_CONFIG': {
      const { key, prop, value } = action.payload
      return {
        ...state,
        receiptFields: state.receiptFields.map((f) =>
          f.key === key ? { ...f, [prop]: value } : f
        ),
      }
    }

    default:
      return state
  }
}

export function TenantProvider({ children }) {
  const [state, dispatch] = useReducer(tenantReducer, initialState)
  const { session } = useSession()

  useEffect(() => {
    if (!session?.tenant?.id) return

    const tenant = mockTenants.tenants.find((t) => t.id === session.tenant.id)

    if (tenant) {
      dispatch({ type: 'LOAD_TENANT', payload: tenant })
    }
  }, [session?.tenant?.id])

  return <TenantContext.Provider value={{ state, dispatch }}>{children}</TenantContext.Provider>
}

export function useTenant() {
  const context = useContext(TenantContext)

  if (!context) {
    throw new Error('useTenant deve ser usado dentro do TenantProvider')
  }

  return context
}
