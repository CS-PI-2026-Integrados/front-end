# Template de saida dos commits

Use este contrato tanto para gerar mensagens quanto para executar commits locais. Escreva a resposta final em Markdown diretamente no chat da sessao do agente. Nao crie um arquivo `.md` para entregar o resultado nem envolva a resposta inteira em um bloco de codigo. Somente as mensagens de commit ficam em blocos `text`.

## Estrutura da resposta

- Comece com o titulo `## Commits gerados` e uma linha `**Resultado:**` que indique mensagens propostas, commits criados, ausencia de alteracoes, execucao parcial ou falha.
- Liste os commits em uma lista numerada, com uma entrada por responsabilidade. Na geracao, siga a ordem recomendada; na execucao automatica, siga a ordem de criacao.
- Em cada entrada, coloque a mensagem completa em um bloco `text`, incluindo corpo e rodapes opcionais, com quebras de linha reais.
- Na execucao automatica, inclua tambem `**Hash:**` com o hash completo e verificado em codigo inline, fora da mensagem. Na geracao de mensagens, omita esse campo; nao invente hashes.
- Inclua somente resultados desta solicitacao. Nunca apresente uma proposta como um commit executado.
- Acrescente `### Observacoes` somente quando houver uma limitacao, falha ou pendencia relevante.
- Traduza titulo, rotulos, resultado e observacoes para o idioma inferido do usuario. Os textos em portugues nos templates abaixo sao exemplos, nao um idioma fixo.
- Use ASCII em toda a resposta, preservando a sintaxe Markdown necessaria, conforme [commit-messages-rules.md](commit-messages-rules.md).

## Template de mensagens propostas

O bloco externo abaixo serve apenas para documentar o template. Na resposta real, escreva seu conteudo diretamente no chat, sem essa cerca externa.

````markdown
## Commits gerados

**Resultado:** Mensagens propostas.

1. **Mensagem**

   ```text
   fix(cache): evita reutilizar respostas expiradas

   Renova a consulta quando o prazo de validade termina.
   ```

2. **Mensagem**

   ```text
   docs(api): documenta os limites de consulta
   ```
````

## Template de commits criados

O hash abaixo e ilustrativo. Na execucao, use somente hashes reais verificados. Repita a entrada para cada commit criado.

````markdown
## Commits gerados

**Resultado:** Commits criados.

1. **Mensagem**

   ```text
   fix(cache): evita reutilizar respostas expiradas
   ```

   **Hash:** `0123456789abcdef0123456789abcdef01234567`
````

## Ausencia de alteracoes e falhas

Sem alteracoes elegiveis no inventario inicial, mantenha o titulo e o resultado, informe brevemente a ausencia de alteracoes no escopo solicitado e omita a lista. Nao invente entradas ou crie commits vazios. Alteracoes excluidas podem continuar pendentes no repositorio; isso nao indica execucao parcial. A ausencia de pendencias depois de criar commits e sucesso, nao ausencia de commits gerados.

```markdown
## Commits gerados

**Resultado:** Nenhum commit gerado.

Nenhuma alteracao pendente foi encontrada no escopo solicitado.
```

Se a analise nao puder ser concluida, ou a execucao falhar antes de criar qualquer commit, indique falha no resultado, omita a lista e explique o bloqueio em `### Observacoes`. Nao apresente a falha como ausencia de alteracoes.

Em execucao parcial, liste somente os commits efetivamente criados e descreva a falha e o que permanece pendente em `### Observacoes`. Se um commit foi criado mas sua verificacao falhou, mantenha-o na lista com o hash confirmado e explique a verificacao pendente.

````markdown
## Generated commits

**Result:** Partial execution.

1. **Message**

   ```text
   fix(cache): avoid reusing expired responses
   ```

   **Hash:** `0123456789abcdef0123456789abcdef01234567`

### Notes

The documentation commit failed its hook. Documentation changes remain pending.
````

Na execucao automatica, reproduza a mensagem efetivamente gravada. Se um hook inserir caracteres fora de ASCII ou dados sensiveis, omita o bloco dessa mensagem, mantenha o hash confirmado e explique a omissao nas observacoes. Nunca exponha conteudo proibido para preencher o template.
