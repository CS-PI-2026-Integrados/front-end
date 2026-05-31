# Arquitetura do Projeto

## Arquitetura formalizada

Este projeto adota, neste momento, uma arquitetura de **React SPA por Camadas Técnicas**.

O objetivo desta formalização é criar uma separação clara de responsabilidades, reduzir acoplamento com dados fictícios e preparar o projeto para uma futura integração com backend sem exigir uma reestruturação completa durante a sprint atual.

Esta arquitetura é uma solução provisória e pragmática. Ela respeita a organização atual do projeto, mas corrige os principais problemas de responsabilidade entre telas, componentes, hooks, services, repositories e mocks.

## Ideia central

A aplicação deve seguir o fluxo:

```txt
Page -> Hook -> Service -> Repository -> Mock/Data Source
```

Ou seja:

- A página renderiza a tela e organiza a experiência do usuário.
- O hook controla estado e comportamento de interface.
- O service executa regras de aplicação.
- O repository acessa a fonte de dados.
- O mock é apenas uma implementação temporária da fonte de dados.

Nenhuma tela, componente visual, context ou hook deve depender diretamente dos arquivos de mock.

## Estrutura de pastas recomendada

```txt
src/
  app/
    App.jsx
    AppRouter.jsx

  pages/
    Dashboard.jsx
    Convicteds.jsx
    Service.jsx
    Login.jsx

  components/
    ui/
    dashboard/
    login/
    guards/
    modals/
    service/

  hooks/
    useLogin.js
    useSession.js
    useDashboardMetrics.js

  context/
    SessionProvider.jsx
    sessionContext.js

  services/
    authService.js
    apenadosService.js
    presencasService.js
    processosService.js

  repositories/
    authRepository.mock.js
    apenadosRepository.mock.js
    presencasRepository.mock.js
    processosRepository.mock.js

  mocks/
    data/

  schemas/
    loginSchema.js

  lib/
    utils.js
    validadorCpf.js
```

A estrutura acima não precisa ser migrada inteira imediatamente. Ela representa o alvo arquitetural da fase atual.

## Responsabilidades por camada

### Pages

As páginas representam rotas ou telas completas da aplicação.

Responsabilidades permitidas:

- Montar a tela.
- Compor componentes.
- Chamar hooks de tela ou de domínio.
- Tratar estados visuais de alto nível, como loading, empty state e erro.

Responsabilidades proibidas:

- Importar mocks diretamente.
- Fazer persistência em `localStorage`.
- Manipular arrays mockados.
- Conter regras de negócio complexas.
- Validar regras que pertencem ao service.

Exemplo incorreto:

```js
import mockApenados from '@/mocks/apenados.json'
```

Exemplo correto:

```js
import { useApenados } from '@/hooks/useApenados'
```

### Components

Componentes devem ser focados em interface.

Responsabilidades permitidas:

- Renderizar dados recebidos por props.
- Emitir eventos por callbacks.
- Controlar estado visual local simples, como abrir modal, alternar aba ou mostrar senha.
- Reutilizar componentes de `components/ui`.

Responsabilidades proibidas:

- Buscar dados diretamente.
- Importar mocks.
- Salvar dados.
- Conhecer detalhes de repository.
- Executar regra de negócio persistente.

### Hooks

Hooks conectam a interface com comportamentos reutilizáveis.

Responsabilidades permitidas:

- Controlar estado de tela.
- Orquestrar chamadas para services.
- Preparar dados para renderização.
- Expor funções para componentes e páginas.

Responsabilidades proibidas:

- Alterar mocks diretamente.
- Duplicar regra de negócio que deveria estar em service.
- Conhecer detalhes da fonte real dos dados.

Exemplo correto:

```js
export function useApenados() {
  const [apenados, setApenados] = useState([])

  async function carregarApenados() {
    const data = await apenadosService.listByTenant()
    setApenados(data)
  }

  return { apenados, carregarApenados }
}
```

### Services

Services representam regras de aplicação e casos de uso.

Responsabilidades permitidas:

- Autenticar usuário.
- Listar apenados por comarca.
- Cadastrar, editar ou inativar apenado.
- Gerar comprovante.
- Criar presença.
- Aplicar regras antes de chamar o repository.

Responsabilidades proibidas:

- Renderizar UI.
- Usar estado React.
- Depender de componentes.

Exemplo:

```js
export async function listApenadosByTenant(tenantId) {
  if (!tenantId) return []
  return apenadosRepository.listByTenant(tenantId)
}
```

### Repositories

Repositories escondem a origem dos dados.

Durante a fase atual, os repositories podem usar mocks, JSON e `localStorage`. Futuramente, essa camada pode ser trocada por chamadas HTTP para uma API.

Responsabilidades permitidas:

- Ler dados mockados.
- Persistir dados no `localStorage`, quando necessário.
- Simular chamadas assíncronas.
- Centralizar acesso a dados.

Responsabilidades proibidas:

- Renderizar UI.
- Conhecer componentes.
- Controlar estado React.
- Implementar regra visual.

Exemplo:

```js
export async function listByTenant(tenantId) {
  return mockApenados.filter((apenado) => apenado.tenantId === tenantId)
}
```

### Mocks

Mocks são dados fictícios usados para simular backend.

Responsabilidades permitidas:

- Armazenar dados estáticos.
- Simular respostas temporárias.

Responsabilidades proibidas:

- Ser importados por páginas.
- Ser importados por componentes visuais.
- Ser alterados diretamente fora dos repositories.

Regra principal:

```txt
Mocks são detalhe de infraestrutura, não parte da regra de tela.
```

### Context

Contexts devem armazenar estado global realmente compartilhado.

Responsabilidades permitidas:

- Sessão do usuário.
- Estado global de autenticação.
- Dados globais inevitáveis.

Responsabilidades proibidas:

- Centralizar toda regra de negócio da aplicação.
- Buscar mocks diretamente.
- Virar substituto genérico para services.

## Modelo de dados

O projeto deve adotar um modelo único para cada entidade.

Para o front-end, a recomendação é usar convenção JavaScript em `camelCase`:

```js
{
  id,
  tenantId,
  fullName,
  cpf,
  dateOfBirth,
  phone,
  address,
  status,
  workingStatus
}
```

Não devem coexistir modelos diferentes para a mesma entidade, como:

```js
tenantId
fullName
phone
```

e:

```js
tenant_id
nome
telefone
```

Caso uma fonte externa use outro formato, a conversão deve ser feita em um mapper ou repository, não dentro da tela.

## Relação com backend futuro

Quando o backend for criado, a aplicação não deve precisar reescrever pages e components.

O objetivo é trocar isto:

```txt
Service -> Repository Mock -> Mock Data
```

por isto:

```txt
Service -> Repository HTTP -> Backend API
```

As telas devem continuar chamando hooks e services da mesma forma.

## Regra de ouro

```txt
UI não conhece mock.
Mock não conhece UI.
Service conhece regra.
Repository conhece fonte de dados.
```
