# Planejamento Arquitetural

## Contexto

O projeto atual é uma React SPA sem backend. Todos os dados são simulados com mocks, arquivos JSON, arrays em memória e uso pontual de `localStorage`.

A organização existente se aproxima de uma arquitetura por camadas técnicas, mas a separação de responsabilidades está inconsistente. Existem telas, hooks, contextos e services acessando mocks diretamente, além de diferentes formatos para a mesma entidade de domínio.

Como a equipe está em uma sprint em andamento com prazos apertados, não será feita uma migração ampla neste momento.

A decisão arquitetural para a fase atual é formalizar a arquitetura como:

```txt
React SPA por Camadas Técnicas
```

com uma regra obrigatória:

```txt
Mocks devem ficar isolados atrás de repositories.
```

## Objetivo da fase atual

O objetivo imediato não é deixar o projeto arquiteturalmente perfeito.

O objetivo é:

- parar o crescimento da dívida arquitetural;
- criar regras simples para a equipe;
- impedir novos acoplamentos diretos com mocks;
- preparar o projeto para backend futuro;
- permitir continuidade da sprint atual;
- criar base para uma futura migração para Feature-Based Architecture.

## Decisão tomada

Neste momento, será adotada a arquitetura:

```txt
React SPA por Camadas Técnicas
```

Essa opção é adequada porque:

- exige menor mudança estrutural imediata;
- é mais fácil para uma equipe com níveis diferentes de experiência;
- reduz risco durante uma sprint com prazo apertado;
- cria uma base mínima de organização;
- permite evoluir para arquitetura por features depois.

## Arquitetura alvo desta etapa

Fluxo recomendado:

```txt
Page -> Hook -> Service -> Repository -> Mock/Data Source
```

Responsabilidades:

```txt
Page
Renderiza tela e compõe componentes.

Component
Apresenta interface e dispara eventos.

Hook
Controla estado de tela e orquestra chamadas.

Service
Executa regras de aplicação e casos de uso.

Repository
Acessa e persiste dados.

Mock
Simula dados temporários.
```

## Pontos críticos identificados

### 1. Acoplamento direto com mocks

Problema:

Arquivos de tela, hooks, context e services acessam mocks diretamente.

Impacto:

- dificulta troca futura por backend;
- espalha conhecimento da fonte de dados;
- aumenta risco de bugs ao modificar dados fictícios;
- obriga refatoração em muitos pontos quando a API real surgir.

Direção correta:

Criar repositories mockados e fazer services dependerem deles.

### 2. Dois modelos para a mesma entidade

Problema:

Existem representações diferentes para a entidade apenado.

Exemplos:

```txt
tenantId, fullName, phone
tenant_id, nome, telefone
```

Impacto:

- telas podem não compartilhar dados corretamente;
- filtros e buscas ficam duplicados;
- maior chance de bugs silenciosos;
- maior dificuldade para integrar backend.

Direção correta:

Adotar um modelo canônico em `camelCase` para o front-end e converter dados legados em mappers/repositories.

### 3. Pages acumulando responsabilidades

Problema:

Algumas pages fazem renderização, regra de negócio, persistência, filtro, paginação e manipulação de dados.

Impacto:

- arquivos grandes;
- baixa testabilidade;
- maior risco ao alterar;
- duplicação de comportamento.

Direção correta:

Manter pages como orquestradoras visuais e mover regras para hooks/services.

### 4. Hooks com responsabilidade excessiva

Problema:

Alguns hooks executam regra de negócio, alteram mocks, geram dados e atualizam estado visual ao mesmo tempo.

Impacto:

- dificulta reutilização;
- dificulta teste;
- mistura UI com persistência;
- cria dependência forte entre tela e dados simulados.

Direção correta:

Hooks devem controlar estado e chamar services. Services executam casos de uso.

### 5. Uso de `localStorage` como banco espalhado

Problema:

O `localStorage` aparece diretamente em fluxos de tela.

Impacto:

- persistência fica descentralizada;
- dados podem divergir;
- dificulta limpeza e migração para API.

Direção correta:

Encapsular `localStorage` em repository ou helper de storage.

### 6. Pastas com nomes incorretos

Problema:

Algumas pastas não representam corretamente seu conteúdo, como componentes dentro de pastas com nome de hook ou service.

Impacto:

- dificulta navegação;
- confunde desenvolvedores menos experientes;
- enfraquece o padrão arquitetural.

Direção correta:

Renomear e reorganizar gradualmente quando os arquivos forem tocados.

## Plano de execução

### Fase 1: Imediata, durante a sprint atual

Objetivo:

Criar regras e impedir novos acoplamentos.

Ações:

- Criar documentação arquitetural.
- Criar instruções para desenvolvedores.
- Definir regra de proibição de imports diretos de mocks em código novo.
- Definir fluxo `Page -> Hook -> Service -> Repository -> Mock`.
- Definir modelo canônico para entidades novas ou modificadas.
- Criar repositories apenas quando uma tarefa precisar.
- Criar services apenas quando uma tarefa precisar.
- Registrar débitos técnicos grandes em vez de abrir refatorações extensas.

### Fase 2: Incremental, ainda na sprint atual

Objetivo:

Aplicar a arquitetura quando arquivos forem modificados.

Política:

```txt
Se a tarefa não toca o arquivo, não refatorar.
Se a tarefa toca o arquivo e o ajuste é pequeno, corrigir.
Se a tarefa depende do fluxo problemático, criar service/repository.
Se o ajuste for grande demais, registrar débito técnico.
```

Prioridade de ajuste:

```txt
1. Autenticação e sessão
2. Apenados
3. Atendimento e comprovantes
4. Dashboard
5. Instituições
```

### Fase 3: Próxima sprint

Objetivo:

Reduzir os principais débitos arquiteturais.

Ações recomendadas:

- Consolidar modelo único de apenado.
- Encapsular todo acesso a `localStorage`.
- Remover imports diretos de mocks fora de repositories.
- Criar services estáveis para auth, apenados, processos e presenças.
- Reorganizar componentes em pastas coerentes.
- Criar mappers para normalização de dados.
- Criar testes para services e mappers.
- Revisar nomenclatura do projeto.

### Fase 4: Avaliação de Feature-Based Architecture

Objetivo:

Avaliar migração para uma arquitetura mais escalável após estabilizar a sprint.

Estrutura candidata:

```txt
src/
  app/
  shared/
  features/
    auth/
    dashboard/
    convicteds/
    service/
    institutions/
```

Essa migração deve ser avaliada depois que as camadas de service e repository estiverem minimamente consolidadas.

## Critérios de sucesso

A fase atual será considerada bem-sucedida se:

- código novo não importar mocks diretamente fora de repositories;
- services forem usados para regras de aplicação;
- repositories esconderem mocks e `localStorage`;
- pages ficarem mais focadas em composição de tela;
- a equipe conseguir explicar a separação de responsabilidades;
- novos PRs seguirem o checklist de arquitetura;
- débitos grandes forem registrados em vez de ignorados.

## Riscos

### Risco 1: Arquitetura provisória virar permanente

Mitigação:

Agendar revisão arquitetural após a sprint atual.

### Risco 2: Interpretações diferentes entre devs

Mitigação:

Usar `ARCHITECTURE.MD` e `DEV_INSTRUCTIONS.MD` como referência obrigatória em PRs.

### Risco 3: Refatorações grandes atrasarem entregas

Mitigação:

Aplicar saneamento incremental e classificar dívida técnica por nível.

### Risco 4: Continuar duplicando modelos de dados

Mitigação:

Definir `camelCase` como modelo padrão do front-end e criar mappers para dados legados.

## Próxima decisão arquitetural

Após a sprint atual, a equipe deve decidir se:

```txt
1. Mantém camadas técnicas formalizadas por mais tempo.
2. Inicia migração gradual para Feature-Based Architecture.
```

A recomendação técnica é iniciar a migração para Feature-Based Architecture somente depois que a camada de services/repositories estiver clara e funcional.
