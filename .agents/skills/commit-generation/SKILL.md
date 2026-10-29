---
name: commit-generation
description: 'Proponha mensagens Conventional Commits sem executar commits. Use para "sugira mensagens de commit", "gere uma mensagem" ou "gere um commit" sem pedido de execucao. Respeite o escopo solicitado; pedidos como "faca os commits locais" usam commit-automatic.'
---

# Geracao de mensagens de commit

Leia os recursos compartilhados, resolvendo os caminhos a partir da pasta desta skill:

- [instructions/commit-analysis-instructions.md](../../instructions/commit-analysis-instructions.md): inventario integral, analise semantica e agrupamento.
- [rules/commit-messages-rules.md](../../rules/commit-messages-rules.md): idioma inferido, ASCII, sintaxe e exemplos das mensagens.
- [rules/commit-output-rules.md](../../rules/commit-output-rules.md): template Markdown com a lista dos commits propostos, entregue diretamente no chat.

Se um recurso obrigatorio estiver indisponivel, indique falha no resultado do template e explique o bloqueio nas observacoes; nao invente regras ou mensagens.

Esta skill opera somente em leitura. Pedidos como "gere um commit", sem instrucao para executar ou gravar o commit, significam gerar a mensagem. Quando houver pedido de execucao, use commit-automatic. Nao modifique arquivos, indice, branches, remotos ou historico, nem crie commits, pull requests ou artefatos no repositorio.

A selecao dos trechos para commit cabe ao usuario. Gere mensagens para todas as alteracoes elegiveis no escopo solicitado, conforme a analise compartilhada. Sem restricao explicita, cubra todas as alteracoes pendentes, sem limitar a analise ao trabalho deste chat.

## Idioma e entrega

Priorize uma preferencia explicita de idioma; caso contrario, infira-o da conversa do usuario, conforme as regras compartilhadas. Normalize mensagens e observacoes para ASCII, sem acentos, emojis ou pontuacao tipografica. Preserve a pontuacao exigida por Conventional Commits e pelo template Markdown.

Escreva o template Markdown compartilhado diretamente no chat da sessao do agente. Indique que sao mensagens propostas e liste uma entrada por mensagem completa, na ordem recomendada para os commits. Omita hashes e nao crie um arquivo `.md` nem envolva a resposta inteira em um bloco de codigo.

Sem alteracoes elegiveis no escopo solicitado, informe que nenhum commit foi gerado e omita a lista; nao afirme que o repositorio esta sem pendencias quando houver alteracoes excluidas. Se nao for possivel concluir a analise, indique falha e descreva o impedimento nas observacoes, sem propor mensagens incompletas. Traduza os titulos e rotulos do template para o idioma inferido.
