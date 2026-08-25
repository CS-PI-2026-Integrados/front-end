# Workspace de instruções para agentes

Este diretório organiza instruções e comportamentos reutilizáveis para agentes que trabalham neste repositório.

## Estrutura

- `skills/`: comportamentos especializados para classes específicas de tarefas.
- `instructions/`: orientações compartilhadas sobre como os agentes devem trabalhar.
- `rules/`: restrições obrigatórias e verificáveis que devem ser respeitadas.
- `agents/`: definições de agentes especializados (`*.agent.md`).

## Skills

Cada skill deve possuir um `SKILL.md` com frontmatter YAML contendo `name` e `description`.

O `SKILL.md` deve conter as orientações essenciais da skill e ser suficiente para compreender seu propósito e comportamento principal.

Use `references/` para detalhes específicos de contexto que só precisam ser carregados quando aplicáveis. Evite duplicar conteúdo entre o arquivo principal e suas referências.

O `name` da skill deve corresponder ao nome do diretório.

## Responsabilidades

Use:

- `instructions/` para orientar **como trabalhar**;
- `rules/` para definir **o que deve ou não deve acontecer**;
- `skills/` para orientar **como executar uma classe especializada de tarefa**;
- `agents/` para definir **papéis especializados e seu comportamento**.

Evite duplicar a mesma orientação em múltiplas categorias.

## Convenções para novos artefatos

Use nomes em minúsculas e separados por hífen, exceto quando o formato exigir nomenclatura específica, como `SKILL.md`.

- Agents: `*.agent.md`.
- Instructions: `*-instructions.md`.
- Rules: `*-rules.md`.
- Skills: diretórios com nomes curtos e descritivos.

# Graphify para novos colaboradores

O Graphify é um projeto open-source que transforma o repositório em um grafo navegável de arquivos, símbolos e
relações. Ele ajuda agentes e colaboradores a localizar fluxos, dependências e
limites arquiteturais sem percorrer o código de forma manual e ampla.

A skill já está disponível em `skills/graphify/`.

Repositório no GitHub: https://github.com/Graphify-Labs/graphify

### Configuração rápida

No diretório raiz do repositório, confirme que a CLI está disponível:

```bash
graphify --version
```

Se o comando não existir, instale-o com `uv`:

```bash
uv tool install graphifyy
```

Para gerar o primeiro grafo sem configurar um agente,
execute:

```bash
graphify . --code-only
graphify cluster-only .
```

### Uso diário

Depois que o grafo existir, consulte-o antes de fazer buscas amplas no código:

```bash
graphify query "Como funciona a autenticação?"
graphify path "useSession" "authService"
graphify explain "usersService"
```

Após modificar código, mantenha o mapa atualizado com:

```bash
graphify update .
```

Não edite manualmente os arquivos em `graphify-out/`; eles são artefatos gerados.
