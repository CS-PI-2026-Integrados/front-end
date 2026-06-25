function ModalInative({ apenado, onConfirmar, onCancelar }) {
  if (!apenado) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl sm:p-6">
        <h2 className="text-lg font-bold text-gray-900">Inativar Apenado</h2>
        <p className="mt-2 text-sm text-gray-600">
          Deseja inativar <strong>{apenado.nome}</strong>? O status será alterado para{' '}
          <span className="font-semibold text-gray-500">Inativo</span>.
        </p>
        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end sm:gap-3">
          <button
            type="button"
            onClick={onCancelar}
            className="w-full rounded-lg border border-gray-200 px-4 py-2 text-sm text-gray-600 transition-colors hover:bg-gray-50 sm:w-auto"
          >
            Cancelar
          </button>
          <button
            type="button"
            onClick={onConfirmar}
            className="w-full rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600 sm:w-auto"
          >
            Inativar
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalInative
