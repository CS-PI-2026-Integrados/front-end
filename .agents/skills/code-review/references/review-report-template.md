# Modelo de relatório de revisão

Use este modelo ao criar o arquivo Markdown da revisão. Substitua os campos entre `<...>` por informações verificadas. Remova apenas campos marcados como opcionais; mantenha as quatro seções obrigatórias, mesmo quando não houver achados.

```md
# Revisão de código — <escopo>

## Resumo

- **Conclusão técnica:** <Aprovada | Reprovada | Inconclusiva>
- **Resultado segundo política aplicável:** <Aprovada | Reprovada | Não se aplica>
- **Motivos principais:** <síntese objetiva dos achados ou da limitação decisiva>

## Escopo

- **Objeto revisado:** <PR, commit, conjunto de alterações ou mudanças locais>
- **Referências de comparação:** <origem, destino, identificadores de revisão ou commits>
- **Contexto relevante:** <contratos, requisitos de aceitação ou componentes consultados>
- **Exclusões:** <itens fora do escopo ou não avaliados>

## Achados

### [<Crítica | Alta | Média | Baixa>] <título objetivo>

- **Problema e condição de ocorrência:** <o que ocorre e em quais condições>
- **Impacto:** <consequência técnica, operacional, de segurança ou de compatibilidade>
- **Evidência:** `<arquivo>:<linha, símbolo ou trecho verificável>`
- **Bloqueio por política:** <não | sim — regra aplicável>
- **Direção de correção:** <opcional; intervenção proporcional à causa>
- **Como verificar:** <opcional; teste, cenário ou análise a executar>

> Repita esta subseção para cada achado, em ordem de impacto. Quando não houver achados relevantes, escreva: `Não foram identificados achados relevantes dentro do escopo revisado.`

## Verificações e limitações

### Verificações realizadas

- `<comando, teste, análise ou reprodução>` — <resultado>

### Limitações e questões em aberto

- <parte não avaliada, hipótese pendente ou lacuna de evidência>

### Próximo passo

<Somente quando houver uma incerteza decisiva: investigação ou informação necessária para concluir.>
```

## Regras de uso

- Não invente referências, linhas, resultados ou impactos.
- Registre verificações não executadas e seu motivo; testes aprovados não comprovam a ausência de defeitos.
- A conclusão `Inconclusiva` é apropriada quando uma limitação essencial impede avaliar o comportamento; indique o próximo passo para removê-la.
- `Resultado segundo política aplicável` é opcional quando não houver política conhecida. Não confunda bloqueio por política com gravidade técnica.
