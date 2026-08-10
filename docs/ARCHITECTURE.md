# Arquitetura do Projeto

## Declaração formal

Este projeto adota arquitetura **feature-based** para uma aplicação React com
JavaScript.

Neste documento, **deve** e **não pode** indicam regras obrigatórias. **Pode**
indica uma opção permitida quando houver necessidade concreta. Exceções exigem
justificativa e atualização deste documento quando
representarem uma nova convenção arquitetural.

O código é organizado por capacidades de negócio, como autenticação, usuários,
apenados, grupos, atendimento e configurações da instituição. Cada feature
mantém próximas as partes que implementam o mesmo comportamento e estabelece
limites claros entre interface, estado React e comunicação com sistemas externos.

## Princípios obrigatórios

- **Coesão por feature:** o código de um domínio fica na feature que o possui.
- **Dependências unidirecionais:** componentes usam hooks; hooks usam services;
  services comunicam-se com sistemas externos.
- **UI isolada:** componentes não conhecem HTTP, armazenamento do navegador,
  formatos de API ou regras de negócio.
- **Services como fronteira externa:** services são a única camada que comunica
  com APIs, autenticação, armazenamento de sessão ou qualquer outro sistema
  externo.
- **Modelo canônico:** a interface trabalha com objetos JavaScript em `camelCase`.
  Conversões de payload são feitas no service, na fronteira externa.
- **Menor escopo de estado:** estado local é preferível; context só é usado para
  estado transversal e compartilhado.
- **Código compartilhado sem domínio:** `shared/` não depende de features.

## Fluxo de responsabilidades

```txt
Route/Page -> Feature components -> Feature hook -> Feature service -> External system
```

Uma etapa só deve existir quando tiver responsabilidade própria. Componentes
puramente visuais podem receber props diretamente; nem todo componente precisa de
hook ou service.

## Exemplar de estrutura de diretórios

```txt
src/
  app/
    App.jsx
    AppRouter.jsx
    providers.jsx

  features/
    auth/
      pages/
      components/
      hooks/
      services/
      schemas/
      model/
      index.js
    users/
      pages/
      components/
      hooks/
      services/
      schemas/
      model/
      index.js

  shared/
    ui/
    lib/
    hooks/
    infrastructure/
      http/
      storage/
    assets/
```

`app/` integra a aplicação. `features/` contém o comportamento de domínio.
`shared/` contém utilitários, infraestrutura e componentes genéricos. O design
system pertence a `shared/ui/`.

O arquivo `index.js` de uma feature, quando existir, define sua API pública.
Ele apenas reexporta os poucos elementos que consumidores externos podem usar;
não contém regra de negócio, efeitos ou inicialização. Pages usadas pelo router e
integrações deliberadas entre features são candidatas à exportação. Componentes,
hooks e services internos não devem ser exportados por conveniência.

As subpastas apresentadas são opcionais. Uma feature só deve criar `pages/`,
`hooks/`, `schemas/`, `model/` ou `index.js` quando possuir código com aquela
responsabilidade.

## Responsabilidades por camada

### App e rotas

`app/` é responsável por bootstrap, providers globais, roteamento, layouts e
guards de rota.

Pode:

- Compor páginas e providers.
- Declarar rotas, carregamento sob demanda e limites globais de erro.
- Aplicar guards baseados em sessão e permissões.

Não pode:

- Implementar caso de uso de feature.
- Fazer comunicação externa ou persistência diretamente.

### Pages e componentes

Pages são pontos de entrada de rota. Componentes representam a interface e ficam
na feature correspondente, exceto componentes genéricos de `shared/ui/`.

Pages ficam em `pages/`; componentes exclusivos da feature ficam em
`components/`. Uma page compõe o fluxo da rota e deve permanecer fina: ela liga
hooks a componentes, sem concentrar regras do domínio.

Podem:

- Renderizar props e dados expostos por hooks.
- Manter estado visual local: diálogos, abas, campos temporários e seleção.
- Emitir eventos por callbacks.
- Exibir estados de loading, erro e vazio.

Não podem:

- Fazer chamadas HTTP, acessar `localStorage` ou qualquer sistema externo.
- Implementar persistência, autorização ou regra de negócio durável.
- Conhecer payloads de APIs ou detalhes de infraestrutura.

Modais, formulários e cartões são componentes. Eles nunca devem ficar em uma
pasta chamada `hooks/`.

### Hooks

Hooks conectam a interface aos casos de uso da feature e concentram o estado de
tela.

Podem:

- Chamar services e adaptar seus resultados para a UI.
- Controlar estados de loading, erro, filtros, paginação e seleção.
- Expor comandos e dados para pages e componentes.
- Sincronizar o React com efeitos de interface necessários.

Não podem:

- Fazer chamadas HTTP, acessar armazenamento ou importar infraestrutura.
- Duplicar regras de autorização, validação de domínio ou transformação de API.
- Retornar JSX; um artefato que retorna JSX é um componente.

### Services

Services implementam casos de uso e são a fronteira de comunicação com sistemas
externos. Cada service pertence à feature que contém o caso de uso.

Podem:

- Fazer requisições HTTP por meio do cliente de `shared/infrastructure/http`.
- Comunicar-se com autenticação, storage de sessão ou outra integração externa.
- Validar pré-condições e regras de aplicação antes da comunicação externa.
- Converter payloads externos para o modelo canônico da feature.
- Traduzir falhas técnicas em erros de domínio previsíveis.

Não podem:

- Usar hooks React, renderizar UI ou disparar notificações visuais.
- Depender de componentes, pages ou contexts.
- Expor formatos externos para hooks ou componentes.

Services devem receber dependências e dados por argumentos explícitos. Não devem
ler estado React ou variáveis globais mutáveis de forma implícita. Respostas HTTP
cruas, códigos de transporte e detalhes de serialização não podem escapar dessa
camada.

Exemplo:

```js
export async function listConvicteds(tenantId) {
  if (!tenantId) return []

  const response = await http.get(`/tenants/${tenantId}/convicteds`)
  return response.data.map(toConvicted)
}
```

### Modelos, schemas e mappers

`model/` descreve o modelo canônico da feature. `schemas/` valida entradas de
formulários e dados externos. Mappers pertencem ao service ou a `model/` quando
forem reutilizados pela mesma feature.

Como o projeto usa JavaScript, `model/` não é uma camada obrigatória nem uma
tentativa de reproduzir tipos estáticos. A pasta só deve existir quando houver
artefatos reutilizáveis, como mappers, constantes de domínio, seletores,
normalizadores ou contratos JSDoc. Uma feature simples pode manter a conversão
privada no próprio service.

O modelo exibido pela aplicação deve usar `camelCase`:

```js
{
  id,
  tenantId,
  fullName,
  cpf,
  phone,
  address,
  status,
  workingStatus,
}
```

Nomes externos, como `tenant_id`, `nome` e `telefone`, não podem alcançar hooks,
pages ou componentes. O service é responsável por convertê-los.

### Contexts e providers

Contexts são reservados para estado transversal, como sessão, tema e configuração
global já carregada. Um provider de feature é permitido quando múltiplos ramos de
um mesmo fluxo precisam do mesmo estado, como atendimento.

Contexts não implementam casos de uso nem comunicação externa. Quando apenas uma
tela precisa do estado, use estado local ou um hook da feature.

O valor de um provider deve ser estável quando necessário, e contextos com partes
de estado que mudam em frequências muito diferentes devem ser separados para
evitar renderizações globais sem relação com a mudança.

### Shared

`shared/` possui código sem domínio específico:

- `shared/ui/`: design system e componentes puramente visuais.
- `shared/lib/`: funções determinísticas e utilitários sem efeito externo.
- `shared/hooks/`: hooks verdadeiramente genéricos.
- `shared/infrastructure/http/`: cliente HTTP, interceptors e configuração de
  transporte.
- `shared/infrastructure/storage/`: adaptadores genéricos de armazenamento.

Código em `shared/` não pode importar uma feature. Se algo atende apenas uma
feature, deve permanecer nela.

## Regras de dependência

```txt
app                -> features, shared
feature components -> feature hooks, shared
feature hooks      -> feature services, shared
feature services   -> shared infrastructure, feature model
shared             -> shared apenas
```

- Features não importam internals de outras features.
- Integrações entre domínios usam a API pública da feature proprietária.
- `shared/ui` não conhece domínio, sessão, rotas ou services.
- Dependências circulares são proibidas.
- Imports usam aliases consistentes, como `@/features/...` e `@/shared/...`.

Exemplo de consumo público:

```js
// features/users/index.js
export { default as UsersManagementPage } from './pages/UsersManagementPage'

// app/AppRouter.jsx
import { UsersManagementPage } from '@/features/users'
```

Importar `@/features/users/services/usersService` a partir de outra feature viola
o limite. Se a integração for legítima, a feature proprietária deve oferecer uma
API pública mínima e estável.

## Padrões React e JavaScript

- Componentes devem ser orientados a props e focados em uma responsabilidade de
  interface. Extraia partes quando uma tela acumular UI, estado e coordenação de
  muitos fluxos.
- Use `useEffect` somente para sincronizar React com um sistema externo ou com a
  vida útil da interface. Não use efeitos para valores derivados.
- Toda operação assíncrona de um hook deve expor estados de loading e erro e não
  pode atualizar estado após unmount ou após uma execução mais recente.
- Use `useMemo` e `useCallback` quando houver uma razão concreta: cálculo caro,
  estabilidade de dependência ou redução de renderizações observável.
- Atualizações de estado devem ser imutáveis. Não altere objetos compartilhados
  por referência.
- A UI valida formato e apresenta erros de campo; o service revalida regras de
  negócio, autorização e transições de estado.
- Notificações, navegação e mensagens visuais pertencem a componentes ou hooks,
  nunca a services.
- Todo parsing de dados externos deve ser validado antes de entrar no estado
  React.
- Hooks customizados começam com `use`. Arquivos que renderizam JSX usam nomes de
  componente em `PascalCase`; funções e arquivos utilitários usam `camelCase`.
- Listas renderizadas devem usar chaves estáveis do domínio. Índices de array não
  devem ser usados como chave quando itens puderem ser inseridos, removidos ou
  reordenados.
- Efeitos devem declarar todas as dependências usadas. Supressões de regras de
  hooks exigem comentário que explique a invariável preservada.

## Operações assíncronas e erros

- Hooks devem representar separadamente `loading`, resultado vazio e erro.
- Requisições substituídas ou componentes desmontados devem cancelar a operação
  quando possível, usando `AbortController`, ou ignorar resultados obsoletos.
- Services devem preservar a causa técnica para diagnóstico e expor ao chamador
  um erro de aplicação seguro e previsível.
- Componentes não devem exibir mensagens técnicas, stack traces ou payloads de
  resposta ao usuário.
- Autenticação expirada e ausência de permissão devem seguir um tratamento
  central e consistente, sem duplicação em cada page.

## Segurança e dados sensíveis

- Services devem enviar somente os dados necessários ao sistema externo.
- Tokens, credenciais e dados pessoais não podem ser escritos em logs, mensagens
  de erro ou estado persistido sem necessidade explícita.
- Autorização no frontend controla a experiência, mas não substitui a validação
  do sistema externo.
- Conteúdo externo deve ser tratado como não confiável e validado antes de uso.

## Critérios de aceite para novas mudanças

- A mudança pertence a uma feature clara ou a `shared/` por motivo justificado.
- Pages, componentes, hooks e contexts não acessam sistemas externos.
- Apenas services comunicam-se com APIs, sessão persistida ou storage.
- A UI recebe e manipula somente modelos canônicos em `camelCase`.
- Casos de uso e conversões de payload estão nos services da feature.
- Estados de loading, erro e vazio são tratados na UI quando aplicável.
- Não há import interno entre features nem dependência circular.
- Código em `shared/` não depende de domínio específico.
- O `index.js`, quando presente, expõe apenas a API pública mínima da feature.
- Operações assíncronas tratam concorrência, cancelamento e erros previsíveis.
- Regras determinísticas e fluxos críticos possuem testes proporcionais ao risco.
- Qualquer exceção arquitetural está justificada e documentada.
