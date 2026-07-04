function ModalAvisoEncerrar({ aberto, onConfirmar, onCancelar }) {
  if (!aberto) return null

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card text-card-foreground border-border w-full max-w-sm rounded-xl border p-6 shadow-2xl">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-yellow-100">
            <svg
              className="h-5 w-5 text-yellow-600"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"
              />
            </svg>
          </div>
          <h2 className="text-foreground text-lg font-bold">Atenção</h2>
        </div>
        <p className="text-muted-foreground text-sm">
          Este é o único processo ativo. Ao encerrar o apenado será dado como inativo no sistema.
          Deseja continuar?
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancelar}
            className="border-border bg-card text-muted-foreground rounded-lg border px-4 py-2 text-sm transition-colors hover:bg-slate-100 dark:hover:bg-slate-950"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirmar}
            className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-red-600"
          >
            Encerrar mesmo assim
          </button>
        </div>
      </div>
    </div>
  )
}

export default ModalAvisoEncerrar
