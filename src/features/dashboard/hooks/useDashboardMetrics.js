import { useMemo } from 'react'

export function useDashboardMetrics(presencas, apenados) {
  const {
    comprovantesRecentes,
    ultimosMesesGrafico,
    contagemMeses,
    ultimaPresenca,
    atividadesRecentes,
  } = useMemo(() => {
    const limite7Dias = new Date().getTime() - 7 * 24 * 60 * 60 * 1000
    const mapaUltimaPresenca = {}

    let recentes = 0

    for (let i = 0; i < presencas.length; i++) {
      const p = presencas[i]
      const timestamp = new Date(p.emitidoEm).getTime()
      if (timestamp >= limite7Dias) recentes++

      if (!mapaUltimaPresenca[p.apenadoId] || timestamp > mapaUltimaPresenca[p.apenadoId]) {
        mapaUltimaPresenca[p.apenadoId] = timestamp
      }
    }

    const ultimosMeses = new Map()
    for (let i = 0; i < 6; i++) {
      const dataMes = new Date()
      dataMes.setDate(1)
      dataMes.setMonth(dataMes.getMonth() - i)
      const anoMes = dataMes.toISOString().slice(0, 7)
      ultimosMeses.set(anoMes, 0)
    }

    presencas.forEach((p) => {
      const mesPresenca = new Date(p.emitidoEm).toISOString().slice(0, 7)
      if (ultimosMeses.has(mesPresenca)) {
        ultimosMeses.set(mesPresenca, ultimosMeses.get(mesPresenca) + 1)
      }
    })

    const contagemPresencas = [...ultimosMeses.values()]
    const ultimasAtividades = [...presencas]
      .sort((a, b) => new Date(b.emitidoEm) - new Date(a.emitidoEm))
      .slice(0, 4)

    return {
      comprovantesRecentes: recentes,
      ultimosMesesGrafico: [...ultimosMeses.keys()].map((k) => {
        return parseInt(k.split('-')[1], 10) - 1
      }),
      contagemMeses: contagemPresencas,
      ultimaPresenca: mapaUltimaPresenca,
      atividadesRecentes: ultimasAtividades,
    }
  }, [presencas])

  const apenadosRegulares = useMemo(() => {
    const limite30Dias = new Date().getTime() - 30 * 24 * 60 * 60 * 1000
    let regulares = 0

    for (let i = 0; i < apenados.length; i++) {
      const ultimaData = ultimaPresenca[apenados[i].id]
      if (ultimaData && ultimaData >= limite30Dias) {
        regulares++
      }
    }

    return regulares
  }, [apenados, ultimaPresenca])

  return {
    comprovantesRecentes,
    ultimosMesesGrafico,
    contagemMeses,
    apenadosRegulares,
    atividadesRecentes,
  }
}

export function formatarTempoRelativo(atividadesRecentes) {
  if (!atividadesRecentes || !Array.isArray(atividadesRecentes)) return []

  const agoraMs = Date.now()
  const umMinuto = 60 * 1000
  const umaHora = 60 * umMinuto
  const umDia = 24 * umaHora
  const umMes = 30 * umDia
  const umAno = 365 * umDia

  return atividadesRecentes.slice(0, 4).map((atividade) => {
    const ms = new Date(atividade.emitidoEm).getTime()
    const diferenca = agoraMs - ms
    let tempoRelativo = ''

    if (isNaN(ms) || ms > agoraMs) {
      tempoRelativo = 'Agora mesmo'
    } else if (diferenca < umaHora) {
      const literal = Math.max(0, Math.floor(diferenca / umMinuto))
      tempoRelativo = `${literal} min`
    } else if (diferenca < umDia) {
      const literal = Math.floor(diferenca / umaHora)
      tempoRelativo = `${literal} ${literal > 1 ? 'horas' : 'hora'}`
    } else if (diferenca < umMes) {
      const literal = Math.floor(diferenca / umDia)
      tempoRelativo = `${literal} ${literal > 1 ? 'dias' : 'dia'}`
    } else if (diferenca < umAno) {
      const literal = Math.floor(diferenca / umMes)
      tempoRelativo = `${literal} ${literal > 1 ? 'meses' : 'mês'}`
    } else {
      const literal = Math.floor(diferenca / umAno)
      tempoRelativo = `${literal} ${literal > 1 ? 'anos' : 'ano'}`
    }

    return tempoRelativo
  })
}
