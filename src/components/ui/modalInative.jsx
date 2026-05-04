function ModalInative({ apenado, onConfirmar, onCancelar }) {
  if (!apenado) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="w-full max-w-sm rounded-xl bg-white p-6 shadow-xl">
        <h2 className="text-lg font-bold text-gray-900">Inativar Apenado</h2>
        <p className="mt-2 text-sm text-gray-600">
          Deseja inativar <strong>{apenado.nome}</strong>? O status será alterado para{' '}
          <span className="font-semibold text-gray-500">Inativo</span>.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            Inativar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalInative
