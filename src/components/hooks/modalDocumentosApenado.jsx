import { useState } from 'react'
import { mockPresenca } from '@/mocks/presenca.mock.js'
import { downloadReceiptPDF } from '@/lib/pdfService.js'
import { mockApenados } from '@/mocks/apenados.mock.js'
import { mockProcessos } from '@/mocks/processos.mock.js'

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function BotaoDownload({ onClick }) {
  return (
    <button
      onClick={onClick}
      title="Baixar PDF"
      className="rounded-lg p-1.5 text-gray-500 transition-colors hover:bg-gray-100 hover:text-green-700"
    >
      <svg
        className="h-4 w-4"
        fill="none"
        stroke="currentColor"
        strokeWidth={2}
        viewBox="0 0 24 24"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5M16.5 12L12 16.5m0 0L7.5 12m4.5 4.5V3"
        />
      </svg>
    </button>
  )
}

function ModalDocumentosApenado({ apenado, onFechar }) {
  const [abaAtiva, setAbaAtiva] = useState('comprovantes')

  if (!apenado) return null

  const comprovantes = (mockPresenca.presencas || []).filter(
    (p) => String(p.apenadoId) === String(apenado.id)
  )

  const abas = [
    { id: 'comprovantes', label: 'Comprovantes de comparecimento', contador: comprovantes.length },
    { id: 'certificados', label: 'Certificados de conclusão', contador: 0 },
  ]

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
      onClick={onFechar}
    >
      <div
        className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between border-b border-gray-100 px-6 py-4">
          <div>
            <h2 className="text-lg font-bold text-gray-900">{apenado.nome}</h2>
            <p className="text-sm text-gray-500">CPF: {apenado.cpf}</p>
          </div>
          <button
            onClick={onFechar}
            className="rounded-lg p-1 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="flex gap-2 border-b border-gray-100 px-6 pt-4">
          {abas.map((aba) => (
            <button
              key={aba.id}
              onClick={() => setAbaAtiva(aba.id)}
              className={`flex items-center gap-2 rounded-t-lg px-4 py-2.5 text-sm font-medium transition-colors ${
                abaAtiva === aba.id
                  ? 'border-b-2 border-green-700 text-green-700'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {aba.label}
              <span
                className={`inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-xs font-semibold ${
                  abaAtiva === aba.id ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                }`}
              >
                {aba.contador}
              </span>
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-4">
          {abaAtiva === 'comprovantes' &&
            (comprovantes.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-gray-400">
                <svg
                  className="h-10 w-10 text-gray-300"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.5}
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
                  />
                </svg>
                <p className="mt-3 text-sm font-medium text-gray-500">
                  Nenhum comprovante encontrado
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-100 bg-gray-50">
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Data/Hora
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Código de verificação
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Operador
                      </th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600">
                        Ação
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprovantes.map((c) => (
                      <tr
                        key={c.id}
                        className="border-b border-gray-50 transition-colors hover:bg-gray-50"
                      >
                        <td className="px-4 py-3 font-medium whitespace-nowrap text-gray-900">
                          {formatarDataHora(c.dateTime)}
                        </td>
                        <td className="px-4 py-3 font-mono text-xs whitespace-nowrap text-gray-600">
                          {c.verificationCode}
                        </td>
                        <td className="px-4 py-3 font-medium text-gray-700">
                          {c.operatorName || 'Admin User'}
                        </td>
                        <td className="px-4 py-3">
                          <BotaoDownload
                            onClick={() => {
                              const apenadoCompleto = {
                                ...apenado,
                                fullName: apenado.nome,
                                tenantId: apenado.tenant_id,
                              }
                              downloadReceiptPDF({
                                apenado: apenadoCompleto,
                                processo: { processNumber: c.processoId },
                                recibo: c,
                              })
                            }}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ))}

          {abaAtiva === 'certificados' && (
            <div className="flex flex-col items-center justify-center py-12 text-gray-400">
              <svg
                className="h-10 w-10 text-gray-300"
                fill="none"
                stroke="currentColor"
                strokeWidth={1.5}
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5"
                />
              </svg>
              <p className="mt-3 text-sm font-medium text-gray-500">
                Nenhum certificado encontrado
              </p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <p className="text-xs text-gray-400">
            Downloads registrados na trilha de auditoria (E06)
          </p>
          <p className="text-xs font-medium text-gray-500">
            {comprovantes.length} documento(s) no total
          </p>
        </div>
      </div>
    </div>
  )
}

export default ModalDocumentosApenado
