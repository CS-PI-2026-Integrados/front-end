---
name: js-ts-async
description: 'Implemente ou revise código assíncrono em JavaScript e TypeScript, incluindo Promises, async/await, concorrência, cancelamento, tratamento de erros e operações em Node.js ou React.'
---

Seu objetivo é aplicar as melhores práticas de programação assíncrona em JavaScript e TypeScript.

Leia referências somente quando forem aplicáveis:

- Para Node.js, consulte [references/node.md](references/node.md).
- Para React, consulte [references/react.md](references/react.md).

## Promises e async/await

- Use Promise<T> para representar resultados assíncronos em TypeScript.
- Use Promise<void> quando não houver valor relevante de retorno.
- Não adicione async quando retornar diretamente uma Promise for suficiente.
- Não use sufixo Async apenas para indicar que uma função retorna uma Promise.

## Concorrência

- Execute operações independentes concorrentemente quando isso reduzir latência.
- Use Promise.all() quando todas as operações precisarem ser concluídas com sucesso.
- Use Promise.allSettled() quando os resultados individuais forem relevantes mesmo em caso de falhas.
- Use Promise.race() ou Promise.any() apenas quando suas semânticas corresponderem ao problema.
- Ao usar Promise.all(), considere que a primeira rejeição encerra a espera, mas não cancela as demais operações.
- Não paralelize operações que possuam dependências ou requisitos de ordenação.
- Limite concorrência quando o volume puder sobrecarregar recursos externos ou o processo.

## Cancelamento

- Use AbortSignal quando a operação suportar cancelamento e isso for relevante.
- Propague o sinal por chamadas assíncronas relacionadas quando apropriado.
- Não introduza cancelamento em operações onde ele não traz benefício prático.

## Tratamento de Erros

- Não capture erros apenas para relançá-los sem acrescentar comportamento.
- Use try/catch quando houver recuperação, tradução, contextualização ou tratamento relevante.
- Não ignore rejeições de Promises.
- Em TypeScript, trate valores capturados como unknown quando necessário.

## Operações não aguardadas

- Não deixe Promises sem tratamento acidentalmente.
- Operações fire-and-forget devem ser deliberadas e possuir estratégia explícita para falhas.
- Use void apenas para tornar explícito que uma Promise não será aguardada e associe .catch() ou outra garantia explícita de tratamento de rejeição.

## Armadilhas Comuns

- Evite forEach(async () => ...) quando for necessário aguardar as operações.
- Use for...of para processamento sequencial.
- Use Promise.all() ou concorrência controlada para operações independentes.
- Não confunda código assíncrono com execução paralela.
- async/await não torna trabalho CPU-bound não bloqueante.

## Revisão

- Identifique o problema, o risco e a evidência no código.
- Sugira a menor correção que preserve a semântica necessária.
- Diferencie operações sequenciais, concorrentes e não aguardadas na justificativa.
