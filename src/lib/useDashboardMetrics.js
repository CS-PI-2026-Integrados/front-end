import { useMemo } from "react";

export function useDashboardMetrics(presencas, apenados) {
    const { comprovantesRecentes, ultimosMesesGrafico, contagemMeses, ultimaPresenca , atividadesRecentes} = useMemo(() => {
        const limite7Dias = new Date().getTime() - (7 * 24 * 60 * 60 * 1000);
        const mapaUltimaPresenca = {};

        let recentes = 0;

        for (let i = 0; i < presencas.length; i++) {
            const p = presencas[i];
            const timestamp = new Date(p.dateTime).getTime();
            if (timestamp >= limite7Dias) recentes++;

            if (!mapaUltimaPresenca[p.apenadoId] || timestamp > mapaUltimaPresenca[p.apenadoId]) {
                mapaUltimaPresenca[p.apenadoId] = timestamp;
            }
        }

        const ultimosMeses = new Map();
        for (let i = 0; i < 6; i++) {
            const dataMes = new Date();
            dataMes.setDate(1);
            dataMes.setMonth(dataMes.getMonth() - i);
            const anoMes = dataMes.toISOString().slice(0, 7);
            ultimosMeses.set(anoMes, []);
        }

        presencas.forEach((p) => {
            const mesPresenca = new Date(p.dateTime).toISOString().slice(0, 7);
            if (ultimosMeses.has(mesPresenca)) {
                ultimosMeses.get(mesPresenca).push(p);
            }
        });

        const contagemPresencas = [...ultimosMeses.keys()].map((c) => ultimosMeses.get(c).length);
        const ultimasAtividades = [...presencas].sort((a, b) => new Date(b.dateTime) - new Date(a.dateTime)).slice(0, 4);

        return {
            comprovantesRecentes: recentes,
            ultimosMesesGrafico: [...ultimosMeses.keys()].map((k) => {
                return parseInt(k.split('-')[1], 10) - 1;
            }),
            contagemMeses: contagemPresencas,
            ultimaPresenca: mapaUltimaPresenca,
            atividadesRecentes: [...ultimasAtividades]
        };
    }, [presencas]);

    const apenadosRegulares = useMemo(() => {
        const limite30Dias = new Date().getTime() - (30 * 24 * 60 * 60 * 1000);
        let regulares = 0;

        for (let i = 0; i < apenados.length; i++) {
            const ultimaData = ultimaPresenca[apenados[i].id];
            if (ultimaData && ultimaData >= limite30Dias) {
                regulares++;
            }
        }

        return regulares;
    }, [apenados, ultimaPresenca]);

    return {
        comprovantesRecentes,
        ultimosMesesGrafico,
        contagemMeses,
        apenadosRegulares,
        atividadesRecentes
    };
}