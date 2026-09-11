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
