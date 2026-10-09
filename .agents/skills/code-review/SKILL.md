---
name: code-review
description: Revise mudanças de código com base em evidências, identifique problemas de correção, segurança, compatibilidade e operação, e produza um relatório Markdown em .review. Use para revisar pull requests, commits, conjuntos de alterações ou mudanças locais. Não se aplica à implementação de correções nem à comparação isolada de alternativas arquiteturais.
---

# Revisão de código

Avalie a mudança solicitada e seus efeitos, com profundidade proporcional ao risco. Produza achados acionáveis, sustentados por evidências, e persista a revisão em um arquivo `.md` dentro da pasta `.review`.

Esta skill é independente de linguagem e não carrega perfis ou referências específicos de tecnologia. Considere o comportamento observado, a stack, os contratos e os requisitos aplicáveis ao projeto, sem impor padrões de arquitetura, organização ou ferramentas.

## Escopo e contexto

- Identifique o objeto da revisão e, quando houver comparação, as versões de origem e destino. Registre referências verificáveis, como identificadores de revisão ou commits, e diferencie mudanças locais de conteúdo já versionado.
- Examine todo o conjunto de alterações solicitado. Inclua testes, configuração, dependências, migrações e implantação quando relevantes ao comportamento alterado. Evite inspeção redundante de artefatos gerados; consulte-os quando necessários para verificar o resultado.
- Leia código e documentação fora do diff quando necessário para compreender contratos, consumidores e efeitos da mudança. Diferencie o contexto consultado dos problemas introduzidos ou agravados pela alteração; não atribua à mudança problemas preexistentes e independentes dela.
- Identifique requisitos de aceitação e convenções documentadas aplicáveis. Diferencie obrigações explícitas de preferências e padrões apenas observados no código.
- Resolva ambiguidades com as evidências disponíveis. Peça um esclarecimento pontual quando a lacuna impedir delimitar o objeto ou avaliar um comportamento essencial; prossiga nas partes independentes e registre os limites da revisão.

## Análise e verificação

- Compreenda o comportamento esperado e compare-o com o resultado da mudança. Rastreie entradas, decisões, efeitos e consumidores nos fluxos relevantes.
- Priorize regressões de comportamento, violações de contrato, integridade dos dados, segurança, compatibilidade e confiabilidade. Examine falhas, concorrência, recursos, desempenho e observabilidade quando houver relação concreta com a alteração.
- Antes de relatar uma proteção ausente, verifique se ela já é garantida por outro componente do mesmo fluxo. Considere validações, autorização, tratamento de erros e garantias transacionais existentes; não exija lógica duplicada.
- Procure explicações alternativas e evidências que possam refutar cada suspeita. Confirme as condições necessárias para o problema ocorrer e diferencie cenários demonstráveis de hipóteses ainda não verificadas.
- Use testes existentes, análise estática ou reproduções pontuais quando ajudarem a confirmar ou refutar um risco. Escolha verificações proporcionais ao problema e registre o que foi executado, seu resultado e o que não pôde ser verificado. Não trate testes aprovados como prova de ausência de defeitos.
- Avalie os testes pela cobertura dos comportamentos afetados. A ausência de teste só constitui um achado quando for possível explicar qual comportamento relevante ficou sem proteção ou qual requisito de teste foi descumprido.
- Relacione problemas de arquitetura, organização ou legibilidade a consequências concretas ou requisitos verificáveis. Evite exigir abstrações, padrões ou refatorações por preferência.
- Recomende intervenções proporcionais à causa do problema. Não transforme a revisão em um projeto de modernização ou implementação; aplique correções apenas quando fizerem parte do pedido.

## Qualidade dos achados

- Relate um achado quando houver evidência de um problema relevante ao escopo, com consequência explicável, ou de uma violação verificável de requisito aplicável. Mantenha suspeitas não confirmadas na seção de limitações ou questões em aberto.
- Para cada achado, explique o problema, a condição de ocorrência, o impacto e a evidência. Cite o arquivo e a localização mais precisa disponível, vinculados à versão revisada. Não invente linhas, resultados de execução ou referências.
- Classifique a gravidade pelo impacto e pelas condições de ocorrência: **crítica** para consequências extremas, como comprometimento amplo ou perda irreversível de dados; **alta** para falha grave de um fluxo relevante; **média** para impacto limitado ou contornável; **baixa** para problema de pequeno impacto. Justifique a classificação no contexto, sem elevá-la apenas pelo número de ocorrências.
- Separe gravidade técnica de bloqueio por política. Uma convenção obrigatória pode impedir a aprovação sem representar um risco técnico crítico; identifique a regra que determina o bloqueio.
- Agrupe ocorrências quando compartilharem causa e correção, preservando as localizações necessárias. Separe problemas que exigirem ações distintas e ordene os achados por impacto.
- Indique uma direção de correção e uma forma de verificar o resultado quando isso ajudar a resolver o problema. Evite prescrever uma implementação completa sem necessidade.
- Não invente achados para preencher o relatório. Uma revisão sem achados relevantes é um resultado válido, limitado à cobertura e às evidências obtidas.

## Relatório Markdown

Escreva em português brasileiro, salvo solicitação de outro idioma. Use Markdown comum, com títulos, listas e blocos de código quando úteis. O relatório deve ser compreensível sem acesso ao histórico da conversa.

Para produzir uma estrutura consistente, use [o template de relatório](references/review-report-template.md). Adapte ou omita somente as partes que não se aplicarem ao escopo, sem remover as seções obrigatórias.

Organize o arquivo assim:

1. **Resumo:** conclusão técnica e principais motivos. Diferencie ausência de achados relevantes, presença de achados e impossibilidade de concluir. Quando houver política de aprovação aplicável, informe também o resultado segundo essa política e os bloqueios correspondentes. Não declare aprovação quando faltar cobertura essencial.
2. **Escopo:** objeto revisado, referências de comparação quando aplicáveis, contexto necessário e exclusões relevantes.
3. **Achados:** itens ordenados por impacto, com título, gravidade, problema e condição de ocorrência, impacto, evidência e orientação de correção quando útil. Identifique bloqueios por política quando existirem. Se não houver achados, declare isso diretamente.
4. **Verificações e limitações:** verificações realizadas e resultados, partes não avaliadas, hipóteses pendentes e lacunas que afetem a conclusão. Indique o próximo passo necessário para resolver uma incerteza decisiva.

Inclua detalhes adicionais apenas quando ajudarem a entender ou resolver um achado. Evite repetir os achados integralmente no resumo ou criar seções de elogios, dívida técnica e planos de ação sem conteúdo necessário.

## Persistência e entrega

- Use a pasta `.review` na raiz do repositório revisado, salvo destino indicado pelo usuário. Quando a revisão não estiver associada a um repositório, use `.review` no diretório de trabalho da revisão.
- Crie a pasta se necessário e salve o relatório como `review-<escopo>-<yyyyMMdd-HHmmss>.md`. Use um identificador curto e seguro para o nome do arquivo, sem separadores de caminho. Para mudanças locais sem identificador, use `local`.
- Preserve relatórios existentes; acrescente um sufixo se houver colisão de nomes. Não inclua relatórios anteriores no escopo de código apenas por estarem no diretório de trabalho.
- Antes de concluir, releia o arquivo salvo e confira a coerência entre resumo, achados, referências e limitações. Se a persistência falhar, informe a falha e entregue o conteúdo no chat sem afirmar que o arquivo foi criado.
- Após salvar, responda com um link para o arquivo e um resumo curto da conclusão e dos limites relevantes. Não reproduza o relatório completo no chat.
