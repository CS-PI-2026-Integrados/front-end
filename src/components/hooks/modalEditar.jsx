import { useState } from 'react'

function ModalEditar({ apenado, onSalvar, onCancelar }) {
  const [form, setForm] = useState(apenado || {})

  if (!apenado) return null

  function handleChange(e) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">Editar Apenado</h2>
        <div className="mt-4 grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Nome</label>
            <input
              name="nome"
              value={form.nome}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">CPF</label>
            <input
              name="cpf"
              value={form.cpf}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Telefone</label>
            <input
              name="telefone"
              value={form.telefone}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div className="col-span-2">
            <label className="mb-1 block text-xs font-semibold text-gray-600">Endereço</label>
            <input
              name="endereco"
              value={form.endereco}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">
              Sit. Trabalhista
            </label>
            <select
              name="sit_trabalhista"
              value={form.sit_trabalhista}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            >
              <option>Trabalho Registrado</option>
              <option>Trabalho Informal</option>
              <option>Nao Trabalha</option>
            </select>
          </div>
          <div>
            <label className="mb-1 block text-xs font-semibold text-gray-600">Status</label>
            <select
              name="status"
              value={form.status}
              onChange={handleChange}
              className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:ring-2 focus:ring-green-700 focus:outline-none"
            >
              <option>Ativo</option>
              <option>Inativo</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={() => onSalvar(form)}
            className="rounded-lg bg-green-800 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-green-900"
          >
            Salvar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalEditar
