# Instruções Para Desenvolvedores

## Objetivo

Este documento define as regras práticas que devem ser seguidas durante a sprint atual.

O projeto está em fase de desenvolvimento com prazos apertados. Portanto, não vamos pausar as entregas para uma grande refatoração arquitetural. A partir de agora, todo código novo deve seguir a arquitetura formalizada em `ARCHITECTURE.MD`, e o código legado deve ser corrigido de forma incremental quando for tocado por uma tarefa.

## Regras obrigatórias

### 1. Não importar mocks diretamente em telas

Arquivos dentro de `pages/` não devem importar arquivos de `mocks/`.

Incorreto:

```js
import mockApenados from '@/mocks/apenados.json'
```

Correto:

```js
import { listApenadosByTenant } from '@/services/apenadosService'
```

ou:

```js
import { useApenados } from '@/hooks/useApenados'
```

### 2. Não importar mocks diretamente em componentes

Componentes devem receber dados por props ou callbacks.

Incorreto:

```js
import { mockPresenca } from '@/mocks/presenca.mock'
```

Correto:

```js
export function RecentActivities({ atividadesRecentes }) {
  return (...)
}
```

### 3. Não alterar arrays mockados fora de repositories

Incorreto:

```js
mockPresenca.presencas.push(novaPresenca)
```

Correto:

```js
await presencasService.create(novaPresenca)
```

### 4. Services devem concentrar regras de aplicação

Use services para operações como:

- login;
- restaurar sessão;
- listar apenados;
- cadastrar apenado;
- editar apenado;
- inativar apenado;
- gerar comprovante;
- registrar presença;
- listar processos.

Exemplo:

```js
export async function inativarApenado(id) {
  if (!id) {
    throw new Error('ID do apenado é obrigatório.')
  }

  return apenadosRepository.updateStatus(id, 'Inativo')
}
```

### 5. Repositories devem esconder a origem dos dados

Durante a sprint atual, repositories podem usar mocks e `localStorage`.

Exemplo:

```js
export async function listByTenant(tenantId) {
  return mockApenados.filter((apenado) => apenado.tenantId === tenantId)
}
```

Futuramente, a implementação pode mudar para HTTP:

```js
export async function listByTenant(tenantId) {
  const response = await api.get(`/tenants/${tenantId}/apenados`)
  return response.data
}
```

A camada acima do repository não deve precisar mudar.

### 6. Use um único modelo de dados

Para código novo, use `camelCase`.

Preferir:

```js
tenantId
fullName
dateOfBirth
phone
workingStatus
```

Evitar em código novo:

```js
tenant_id
nome
data_nascimento
telefone
situacao_trabalhista
```

Se for necessário consumir dados legados em outro formato, crie uma função de conversão.

### 7. Componentes devem ser visuais

Componentes podem:

- renderizar;
- receber props;
- emitir eventos;
- controlar estado visual local simples.

Componentes não devem:

- buscar dados mockados;
- salvar dados;
- manipular `localStorage`;
- conter regras de negócio extensas.

### 8. Hooks devem orquestrar tela e chamar services

Hooks podem:

- controlar loading;
- controlar erro;
- manter estado de tela;
- chamar services.

Hooks não devem:

- importar mocks;
- alterar arrays mockados;
- concentrar regras que pertencem a services.

### 9. `localStorage` deve ser encapsulado

Evite usar `localStorage` diretamente em pages e components.

Se for necessário usar armazenamento local, prefira criar uma camada específica:

```txt
repositories/
  apenadosRepository.mock.js

lib/
  storage.js
```

### 10. Não fazer refatoração sem relação com a tarefa

Durante a sprint atual, não devemos abrir grandes refatorações fora do escopo da tarefa.

Refatore apenas quando:

- o arquivo será alterado pela tarefa;
- o ajuste arquitetural for pequeno;
- a falta de ajuste bloquear ou prejudicar a implementação;
- o próprio autor do código legado estiver mexendo novamente no trecho.

## Política para código legado

Ao tocar um arquivo fora do padrão, classifique a situação:

```txt
Nível 0: Não tocar
O arquivo não faz parte da tarefa. Não refatorar.

Nível 1: Ajuste local obrigatório
O arquivo será alterado e o ajuste é pequeno. Corrigir junto.

Nível 2: Refatoração parcial
A tarefa depende de um fluxo mal estruturado. Criar service/repository antes de continuar.

Nível 3: Refatoração adiada
A correção é grande demais para a sprint. Registrar débito técnico.
```

## Regra especial para autores de código legado

Se o desenvolvedor responsável pela tarefa também foi o autor do código legado afetado, ele deve priorizar mais fortemente a correção arquitetural daquele trecho.

Essa regra existe porque o autor original tende a conhecer melhor o código e, portanto, tem menor custo de correção.

Ela não deve ser interpretada como punição, mas como uma forma de reduzir dívida técnica com menor impacto na sprint.

## Checklist antes de abrir PR

Antes de abrir um PR, verifique:

- A tarefa criou algum import direto de `mocks/` em `pages/`, `components/`, `context/` ou `hooks`?
- A regra de negócio ficou dentro de um componente visual?
- Existe acesso direto a `localStorage` em tela ou componente?
- O código novo usa o modelo de dados padronizado?
- A operação deveria estar em um service?
- A leitura ou escrita de dados deveria estar em um repository?
- O nome da pasta condiz com o conteúdo?
- O arquivo alterado tinha dívida arquitetural simples de corrigir?
- Alguma refatoração grande foi deixada registrada como débito técnico?

## Regra de decisão rápida

Quando houver dúvida, use esta ordem:

```txt
1. A tela renderiza.
2. O componente apresenta.
3. O hook orquestra.
4. O service decide.
5. O repository acessa dados.
6. O mock apenas simula.
```
