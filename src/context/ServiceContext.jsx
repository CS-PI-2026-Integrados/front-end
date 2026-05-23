import React, { createContext, useContext, useEffect, useState } from 'react'

const ServiceContext = createContext()

export const ServiceProvider = ({ children }) => {
  const [atendimento, setAtendimento] = useState({
    apenado: null,
    processo: null,
  })

  const [fotoAtendimento, setFotoAtendimento] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [alteracoes, setAlteracoes] = useState({})
  const [isSuccess, setIsSuccess] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')

  return (
    <ServiceContext.Provider
      value={{
        atendimento,
        setAtendimento,
        fotoAtendimento,
        setFotoAtendimento,
        isSubmitting,
        setIsSubmitting,
        alteracoes,
        setAlteracoes,
        isSuccess,
        setIsSuccess,
        errorMessage,
        setErrorMessage,
      }}
    >
      {children}
    </ServiceContext.Provider>
  )
}

export const useService = () => {
  const context = useContext(ServiceContext)
  if (!context) {
    throw new Error('Erro ao usar o ServiceContext.')
  }
  return context
}
