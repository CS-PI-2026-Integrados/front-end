# Assincronismo em Node.js

Aplique estas diretrizes junto à skill `js-ts-async` quando o código executar em Node.js.

## Event Loop

- Evite trabalho CPU-bound prolongado no event loop.
- Não presuma que adicionar `async` ou `await` torna processamento pesado não bloqueante.
- Considere Worker Threads, processamento externo ou outra estratégia quando CPU-bound justificar isolamento.

## I/O e Concorrência

- Execute I/O independente concorrentemente quando apropriado.
- Evite criar grandes quantidades de operações simultâneas sem controle.
- Considere limites de banco de dados, sockets, APIs externas, pools e sistema de arquivos.

## Streams

- Considere streams quando dados grandes puderem ser processados incrementalmente.
- Preserve backpressure em pipelines de streaming.
- Não use streams quando carregar o conteúdo integralmente for mais simples e adequado.

## Cancelamento e Recursos

- Propague `AbortSignal` para APIs que suportem cancelamento quando relevante.
- Cancele timers, remova listeners, encerre streams e libere conexões quando deixarem de ser necessários.
- Garanta tratamento explícito para falhas em operações iniciadas sem `await`.
- Ao encerrar o processo, pare de aceitar novo trabalho e aguarde ou cancele o trabalho em andamento conforme o contrato da aplicação.

## Encerramento

Em processos persistentes, considere encerramento controlado quando houver recursos ou operações que precisem ser finalizados antes do término do processo.
