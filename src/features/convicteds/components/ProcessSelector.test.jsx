import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest'
import { ProcessSelector } from './ProcessSelector'
import { processService } from '../services/processService'

vi.mock('../services/processService', () => ({
  processService: { search: vi.fn(), create: vi.fn() },
}))

const number = '0001234-56.2026.8.26.0001'
const process = { id: 'process-1', number, status: 'ACTIVE', linkedConvictedCount: 0 }
const creationLabel = `Cadastrar novo processo: ${number}`

beforeAll(() => {
  vi.stubGlobal(
    'ResizeObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  )
  HTMLElement.prototype.scrollIntoView = vi.fn()
})

beforeEach(() => {
  processService.search.mockResolvedValue({ items: [] })
})
afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

async function search(value = number, props = {}) {
  const onChange = vi.fn()
  render(<ProcessSelector onChange={onChange} {...props} />)
  fireEvent.focus(screen.getByRole('combobox', { name: 'Processo' }))
  const input = screen.getByRole('combobox', { name: 'Processo' })
  fireEvent.change(input, { target: { value } })
  await waitFor(() => expect(processService.search).toHaveBeenCalled())
  await waitFor(() => expect(screen.queryByText('Buscando processos...')).toBeNull())
  return { onChange, input }
}

describe('ProcessSelector', () => {
  it('keeps existing search and selection without offering a duplicate', async () => {
    processService.search.mockResolvedValue({ items: [process] })
    const { onChange } = await search()
    expect(screen.queryByRole('option', { name: creationLabel })).toBeNull()
    fireEvent.click(screen.getByRole('option', { name: number }))
    expect(onChange).toHaveBeenCalledWith([{ ...process, principal: true }])
  })

  it('offers creation for a complete number and selects the returned process', async () => {
    processService.create.mockResolvedValue(process)
    const { onChange } = await search('00012345620268260001')
    fireEvent.click(screen.getByRole('option', { name: creationLabel }))
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([{ ...process, principal: true }]))
    expect(processService.create).toHaveBeenCalledWith(number)
  })

  it('does not offer creation for an invalid or incomplete number', async () => {
    await search('0001234-56')
    expect(screen.queryByRole('option', { name: /Cadastrar novo processo/ })).toBeNull()
  })

  it('keeps the query and selection when creation fails and allows retry', async () => {
    processService.create
      .mockRejectedValueOnce(new Error('Falha ao cadastrar.'))
      .mockResolvedValue(process)
    const { input, onChange } = await search()
    fireEvent.click(screen.getByRole('option', { name: creationLabel }))
    expect(await screen.findByRole('alert')).toHaveProperty('textContent', 'Falha ao cadastrar.')
    expect(input.value).toBe(number)
    expect(onChange).not.toHaveBeenCalled()
    fireEvent.click(screen.getByRole('option', { name: creationLabel }))
    await waitFor(() => expect(onChange).toHaveBeenCalled())
  })

  it('prevents repeated creation while the request is pending', async () => {
    let resolve
    processService.create.mockReturnValue(
      new Promise((done) => {
        resolve = done
      })
    )
    await search()
    fireEvent.click(screen.getByRole('option', { name: creationLabel }))
    const pending = await screen.findByRole('option', { name: 'Cadastrando processo...' })
    expect(pending.getAttribute('aria-disabled')).toBe('true')
    expect(screen.getByRole('combobox', { name: 'Processo' }).readOnly).toBe(true)
    fireEvent.click(pending)
    expect(processService.create).toHaveBeenCalledTimes(1)
    resolve(process)
    await waitFor(() =>
      expect(screen.queryByRole('option', { name: 'Cadastrando processo...' })).toBeNull()
    )
  })

  it('keeps the existing principal process when adding a new process', async () => {
    processService.create.mockResolvedValue(process)
    const selected = {
      ...process,
      id: 'other-process',
      number: '0002345-67.2026.8.26.0001',
      principal: true,
    }
    const { onChange } = await search(number, { processes: [selected] })
    fireEvent.click(screen.getByRole('option', { name: creationLabel }))
    await waitFor(() =>
      expect(onChange).toHaveBeenCalledWith([selected, { ...process, principal: false }])
    )
  })

  it('does not offer creation for a process already selected', async () => {
    await search(number, { processes: [{ ...process, principal: true }] })
    expect(screen.getByText('Este processo já está selecionado.')).toBeTruthy()
    expect(screen.queryByRole('option', { name: creationLabel })).toBeNull()
  })

  it('starts as an editable text input and keeps text when suggestions are dismissed', async () => {
    const { input } = await search()
    expect(input.tagName).toBe('INPUT')
    fireEvent.keyDown(input, { key: 'Escape' })
    expect(screen.queryByRole('option', { name: creationLabel })).toBeNull()
    expect(input.value).toBe(number)
    fireEvent.focus(input)
    expect(screen.getByRole('option', { name: creationLabel })).toBeTruthy()
  })

  it('creates through the embedded suggestions using Enter', async () => {
    processService.create.mockResolvedValue(process)
    const { input, onChange } = await search()
    fireEvent.keyDown(input, { key: 'Enter' })
    await waitFor(() => expect(onChange).toHaveBeenCalledWith([{ ...process, principal: true }]))
    expect(input.value).toBe('')
  })
})
