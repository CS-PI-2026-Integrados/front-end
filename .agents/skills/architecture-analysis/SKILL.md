---
name: architecture-analysis
description: Analise decisões de design e arquitetura de software com base em contexto e evidências. Use para decisões em aberto ou avaliações explícitas sobre responsabilidades, contratos, dependências, estado, transações, escalabilidade e consequências operacionais.
---

# Análise de design e arquitetura

Produza uma análise que ajude a tomar uma decisão concreta. Ajuste a profundidade ao impacto e às incertezas, considerando domínio, stack, restrições, convenções do repositório e ambiente operacional. Não imponha um estilo arquitetural ou relatório fixo. Use apenas os critérios relevantes; estas seções não são um checklist obrigatório.

## 1. Aplicação e escopo

- Em propostas de novos componentes, derive comportamento e garantias dos requisitos; não os apresente como fatos de uma implementação ainda inexistente.
- Em melhorias de sistemas existentes, investigue os fluxos e componentes indicados e concentre-se no que pode alterar a decisão. Não transforme uma tarefa local em auditoria do sistema.
- Em revisões, considere o comportamento e os consumidores afetados. Diferencie defeitos demonstráveis de oportunidades de design: uma organização alternativa não constitui, por si só, problema ou bloqueio.

## 2. Contexto e investigação

- Delimite problema, resultado esperado e restrições determinantes. Diferencie requisitos de preferências, fatos observados de informações fornecidas e hipóteses de conclusões. Não presuma volume, disponibilidade, orçamento, capacidade de engenharia ou maturidade da equipe.
- Quando depender do sistema existente, rastreie um fluxo representativo da entrada aos efeitos, consumidores e falhas pertinentes. Identifique quem decide, executa, possui ou modifica o estado e os contratos entre esses participantes. Inspecione outras variantes apenas se puderem mudar a conclusão.
- Examine as garantias que precisam permanecer verdadeiras: entradas, resultados, erros, propriedade e duração dos dados e, quando pertinentes, limites transacionais, consistência e efeitos parciais. Em propostas novas, explicite essas garantias a partir dos requisitos, distinguindo-as do comportamento existente.
- Trate regras espalhadas, mudanças coordenadas, detalhes internos expostos, dependências cíclicas e sequências frágeis como sinais a investigar, não defeitos presumidos. Fundamente conclusões em código, configurações, documentação ou medições; não infira desempenho ou escala apenas pela estrutura.
- Se uma lacuna puder mudar a decisão, faça a menor verificação útil autorizada. Peça esclarecimento quando depender do usuário; se exigir recursos indisponíveis, indique a verificação necessária. Caso contrário, explicite hipóteses e condições de validade. Pare quando novas verificações não se justificarem pelo impacto esperado.

## 3. Responsabilidades e contratos

- Avalie coesão, acoplamento e motivos de mudança. Reúna decisões que precisam preservar regras em conjunto e separe responsabilidades que evoluem independentemente. Ao encontrar comportamentos semelhantes, compare regras, consumidores e motivos de mudança: centralize conhecimento compartilhado quando isso evitar divergências ou garantir invariantes conjuntas; preserve diferenças legítimas quando houver apenas semelhança de implementação.
- Ao transferir uma responsabilidade, verifique se o destino possui contexto, dados e autoridade para cumprir suas garantias, inclusive diante de falhas e resultados desconhecidos. Avalie contratos e coordenação necessários e se a mudança reduz o acoplamento ou apenas o desloca, concentra decisões demais ou distribui complexidade entre consumidores.
- Justifique abstrações e pontos de extensão por variações e consumidores concretos. Prefira contratos que expressem operações necessárias, encapsulem garantias e ocultem detalhes internos. Não introduza interfaces, herança, camadas ou configuração por simetria ou flexibilidade hipotética.

## 4. Alternativas e consequências

- Identifique os critérios que distinguem as opções e seu peso no contexto. Compare alternativas materialmente diferentes pelos mesmos critérios, incluindo manter a solução atual ou fazer uma mudança localizada quando viáveis; não invente opções para preencher a comparação. Considere apenas atributos pertinentes, como compreensibilidade, manutenção, testabilidade, desempenho, segurança, confiabilidade e custos de implementação e operação.
- Explique o mecanismo e o custo de cada benefício: qual dependência, fluxo, contrato ou responsabilidade muda e por que isso melhora o resultado. Procure evidências contrárias, como regras divergentes, garantias existentes e novos acoplamentos. Rótulos como “desacoplado” ou “escalável” não bastam; considere limitações da stack e justifique desvios das convenções do repositório.
- Examine consequências operacionais pertinentes, como modos de falha, comportamento sob carga, consistência, implantação, observabilidade, recuperação e previsibilidade operacional. Indique como mitigar ou verificar riscos determinantes, sem presumir exigências não informadas.
- Prefira a solução mais simples que satisfaça os requisitos determinantes, considerando implementação, manutenção e operação. Inclua migrações, substituições e redesenhos quando relevantes; para recomendá-los, explique por que mudanças menores são insuficientes ou menos vantajosas. Avalie compatibilidade, reversibilidade, continuidade operacional e custo e risco da transição; escolha entre transição incremental e atômica conforme essas condições.

## 5. Decisão e execução

- Conclua com recomendação justificada, principais desvantagens aceitas e condições ou evidências que mudariam a decisão. Se a investigação não sustentar mudanças, explique por que manter a solução atual. Se não permitir uma escolha, identifique a incerteza decisiva e o próximo passo; não termine apenas em “depende”.
- Para cada oportunidade, conecte comportamento observado ou requisito, consequência concreta ou risco previsto e mudança proposta. Distinga evidências de projeções e explique como a intervenção atua sobre a causa. Priorize múltiplas oportunidades por impacto, força das evidências, esforço e dependências.
- Organize a resposta conforme a tarefa, sem relatório fixo. Indique como verificar as mudanças e preservar as garantias existentes. Detalhe a implementação apenas quando solicitado ou necessário para avaliar viabilidade.
- Em pedidos analíticos, entregue a análise. Quando a implementação fizer parte do pedido, execute apenas dentro do escopo autorizado; identificar uma alternativa não amplia essa autorização.
