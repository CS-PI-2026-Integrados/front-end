# Assincronismo em React

Aplique estas diretrizes junto à skill `js-ts-async` quando o código estiver relacionado ao ciclo de vida ou estado de componentes React.

## Effects

- Use Effects para sincronização com sistemas externos, não como mecanismo padrão para qualquer lógica assíncrona.
- Mantenha setup e cleanup coerentes.
- Cancele ou invalide operações quando mudanças de dependência puderem tornar resultados anteriores obsoletos.
- Evite race conditions entre requisições concorrentes.
- Escreva Effects e cleanup que tolerem execuções repetidas durante o desenvolvimento.

## Data Fetching

- Não presuma que `useEffect` é sempre o local correto para buscar dados.
- Respeite a estratégia de data fetching já adotada pelo projeto.
- Prefira mecanismos de cache, deduplicação e gerenciamento de estado assíncrono existentes quando eles resolverem o problema.

## Eventos

- Operações assíncronas iniciadas por ações do usuário normalmente pertencem ao event handler ou à abstração responsável pela ação.
- Trate explicitamente estados relevantes como carregamento, sucesso e falha.

## Hooks

- Encapsule lógica assíncrona em hooks quando isso estabelecer uma responsabilidade reutilizável ou simplificar o componente.
- Não crie hooks apenas para mover código sem estabelecer uma abstração útil.

## Cleanup

- Use `AbortSignal` quando a API utilizada suportar cancelamento e a operação puder se tornar obsoleta.
- Não permita que resultados antigos sobrescrevam estados correspondentes a operações mais recentes.
- Mantenha um mecanismo de invalidação quando a API não aceitar cancelamento.
