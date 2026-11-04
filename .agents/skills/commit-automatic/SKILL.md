---
name: commit-automatic
description: 'Execute commits locais com mensagens Conventional Commits quando solicitado, como "faca os commits locais", "commite estas alteracoes" ou "gere e execute os commits". Respeite o escopo autorizado. Pedidos apenas de mensagens ou "gere um commit" sem execucao usam commit-generation.'
---

# Execucao local de commits

Leia os recursos compartilhados, resolvendo os caminhos a partir da pasta desta skill:

- [instructions/commit-analysis-instructions.md](../../instructions/commit-analysis-instructions.md): analise integral e grupos de responsabilidade.
- [rules/commit-messages-rules.md](../../rules/commit-messages-rules.md): idioma inferido, ASCII, sintaxe e exemplos das mensagens.
- [rules/commit-output-rules.md](../../rules/commit-output-rules.md): template Markdown com a lista dos commits criados, entregue diretamente no chat.

Se faltar um recurso obrigatorio, indique falha no resultado do template e explique o bloqueio nas observacoes antes de modificar o repositorio.

## Autorizacao e preparacao

O pedido para executar este fluxo em um repositorio identificado autoriza preparar as alteracoes e criar os commits locais. Apresente o plano em comentario e prossiga sem pedir aprovacao repetida para acoes ja autorizadas. Pedidos para criar, editar, explicar ou simular a skill nao autorizam executa-la em um repositorio real.

A selecao de arquivos e trechos cabe ao assistente dentro do escopo autorizado, conforme a analise compartilhada. Sem restricao explicita, cubra todo o diff pendente, independentemente de autoria ou sessao. Inventariar o repositorio inteiro nao autoriza commitar alteracoes excluidas pelo usuario.

Antes de modificar o repositorio, confira raiz, branch atual, identidade Git, ausencia de conflitos e de operacoes Git em andamento. Em HEAD destacado, solicite a branch de destino. Nao crie branch ou identidade por conta propria. Se houver um bloqueio, preserve o estado e informe a pendencia no template.

Registre o estado inicial, incluindo alteracoes elegiveis e excluidas, e apresente o escopo, os grupos e mensagens planejados em comentario, no idioma inferido e em ASCII. Mantenha um registro proprio de commits criados nesta execucao, inicialmente vazio. Nao inicialize esse registro com commits anteriores.

## Execucao por grupo

Prepare e execute um grupo por vez, verificando o diff preparado e a mensagem antes de cada commit.

- Preserve o conteudo ja preparado, incluindo versoes presentes somente no indice. Quando indice e arvore de trabalho diferirem, escolha uma ordem que preserve ambas as camadas.
- Prepare somente arquivos ou trechos do grupo. Nao use `git add .` ou `git add -A` indiscriminadamente quando houver grupos distintos.
- Confira que todo o diff a ser gravado pertence ao grupo autorizado, inclusive o conteudo que ja estava preparado. Isole alteracoes excluidas por preparacao seletiva ou indice temporario, preservando suas versoes e sua preparacao. Se nao puder garantir essa separacao, interrompa antes do commit.
- Para separar responsabilidades misturadas no indice, use preparacao seletiva ou um indice temporario. Antes de retirar conteudo preparado, salve uma copia recuperavel fora do repositorio, como um patch com `git diff --cached --binary --output=<arquivo>`. Reaplique os trechos de cada grupo sem substituir o conteudo da arvore de trabalho.
- Grave as mensagens em arquivos temporarios UTF-8 sem BOM fora do repositorio, com texto ASCII e quebras de linha reais, e execute `git commit --file <arquivo>`. Nao inclua rotulos, hashes ou cercas Markdown na mensagem gravada.
- Apos cada sucesso, identifique o commit pelo resultado do comando e resolva seu hash completo. Registre esse hash imediatamente e confira a mensagem e o conteudo gravados. Nao use apenas o HEAD atual se outro processo puder te-lo alterado entre o commit e a leitura.
- Se o comando falhar, confira se chegou a criar um commit antes de decidir o resultado. Registre somente commits comprovadamente criados nesta execucao. Se a verificacao posterior falhar, preserve o hash confirmado e informe a limitacao; nao perca um commit criado do registro.

Respeite hooks e verificacoes exigidos pelo repositorio. Se um commit falhar ou a separacao nao puder ser garantida sem perda, pare, preserve o estado e informe o que foi concluido e o que continua pendente. Nao ignore hooks nem repita uma falha sem tratar sua causa.

Se hooks modificarem a mensagem, confira novamente idioma, ASCII e sintaxe. Se houver divergencia, interrompa o fluxo e relate a mensagem efetivamente gravada e a limitacao, sem alterar o historico automaticamente. Se a mensagem gravada violar ASCII ou contiver dados sensiveis, omita o bloco dessa mensagem, mantenha o hash confirmado e explique a omissao nas observacoes; nunca reproduza conteudo proibido para cumprir o template.

Se hooks ou processos alterarem arquivos, reanalise antes de inclui-los em outro commit, respeitando o escopo autorizado. Nao sobrescreva trabalho concorrente. Apos todos os grupos, confronte o estado final com o inventario completo: confirme a cobertura das alteracoes elegiveis e a preservacao do conteudo e da preparacao das excluidas. Pendencias fora do escopo nao tornam a execucao parcial.

Sem alteracoes elegiveis no escopo solicitado, nao crie commit vazio.

## Limites da execucao

Nao execute `git pull`, `git push` ou outra sincronizacao com o remoto. Os commits permanecem locais.

Nao crie pull request nem tente stash, reset, limpeza, rebase, merge ou push forcado como recuperacao automatica.

## Lista exclusiva e saida final

Use o registro desta execucao para montar diretamente o template de [commit-output-rules.md](../../rules/commit-output-rules.md), na ordem de criacao. Leia as mensagens dos hashes registrados para confirmar o resultado, sem depender de scripts externos, links de revisao ou configuracao de remotos.

Nao use os ultimos N commits de HEAD, datas do historico ou buscas gerais para determinar a lista. Commits anteriores, de outro processo ou de outra execucao nao entram.

- Pelo menos um commit criado e todos os grupos elegiveis concluidos e verificados: indique commits criados no resultado e liste mensagem completa e hash completo de cada commit, mesmo que nao restem grupos pendentes.
- Nenhuma alteracao elegivel encontrada no inventario inicial e nenhum commit criado: informe que nenhum commit foi gerado, omita a lista e explique a ausencia de alteracoes no escopo, no idioma inferido e em ASCII.
- Fluxo interrompido apos criar pelo menos um commit: indique execucao parcial, liste somente os commits efetivamente criados e explique a falha e as pendencias nas observacoes.
- Impedimento antes de criar qualquer commit: indique falha, omita a lista e informe o motivo nas observacoes.

Escreva o template Markdown diretamente no chat da sessao do agente, com titulos e rotulos no idioma inferido. Nao crie um arquivo `.md` para a entrega nem envolva a resposta inteira em um bloco de codigo. Nao invente hashes nem substitua uma falha de consulta por commits antigos.
