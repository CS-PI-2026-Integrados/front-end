# Regras das mensagens de commit

Siga [Conventional Commits 1.0.0](https://www.conventionalcommits.org/en/v1.0.0/) e as regras locais abaixo.

## Idioma e caracteres

- Priorize o idioma explicitamente solicitado. Na ausencia dessa preferencia, infira o idioma da ultima solicitacao em linguagem natural do usuario e use o restante da conversa se ela for curta ou ambigua. Codigo, diffs, branches e o idioma destas instrucoes nao definem o idioma da resposta. Sem qualquer sinal na conversa, use ingles.
- Escreva descricao, corpo, valores dos rodapes, comentarios de progresso e notas finais no idioma escolhido. Nao fixe portugues do Brasil nem copie automaticamente o idioma dos exemplos.
- Use somente ASCII imprimivel (U+0020 a U+007E) e quebras de linha nas mensagens e respostas. Remova diacriticos, translitere outros alfabetos quando necessario e substitua pontuacao tipografica por equivalentes ASCII. Nao use emojis, simbolos decorativos, tabulacoes ou outros controles.
- Preserve a pontuacao ASCII necessaria para Conventional Commits e para o template Markdown, como parenteses, dois-pontos, exclamacao, cerquilhas, asteriscos e crases. Preserve os tokens tecnicos `feat`, `fix` e `BREAKING CHANGE`.
- Essa normalizacao se aplica somente a saida, sem modificar o conteudo do repositorio. Reformule referencias a nomes com caracteres fora de ASCII quando necessario.

## Estrutura

```text
<tipo>[escopo opcional][! opcional]: <descricao>

[corpo opcional]

[rodapes opcionais relevantes]
```

- Use `feat` para funcionalidade nova e `fix` para correcao de defeito. Para outras finalidades, escolha um tipo convencional coerente, como `build`, `chore`, `ci`, `docs`, `style`, `refactor`, `perf`, `test` ou `revert`.
- Mantenha o tipo em ingles e em minusculas. Classifique pelo proposito predominante, nao pela extensao do arquivo.
- O escopo e opcional: um substantivo curto entre parenteses identifica a area afetada. Omita-o quando nao acrescentar contexto ou nao houver uma area comum.
- Use `: ` apos tipo, escopo e eventual `!`, seguido de uma descricao curta, especifica, compreensivel isoladamente e sobre alteracoes ja realizadas. Evite ponto final, Markdown, aspas desnecessarias e termos vagos.

## Corpo e rodapes

O corpo e opcional. Use-o para motivacao, decisao arquitetural, compatibilidade ou consequencia relevante que nao caiba na descricao. Separe-o do titulo por uma linha em branco; nao repita o titulo nem transforme a mensagem em tutorial ou lista de arquivos.

Rodapes sao opcionais e comecam apos uma linha em branco, depois do corpo ou do titulo. Cada rodape usa um token seguido de `: ` e seu valor. Substitua espacos no token por hifens, exceto em `BREAKING CHANGE`. Mantenha rodapes diferentes em linhas consecutivas da mesma secao.

## Quebra de compatibilidade

Indique toda mudanca incompativel com `!` imediatamente antes de `:` ou com `BREAKING CHANGE: <impacto e migracao>` no rodape. Ambos podem coexistir. Sem esse rodape, a descricao deve explicar a incompatibilidade.

Mantenha `BREAKING CHANGE` em ingles e em maiusculas. O marcador pode acompanhar qualquer tipo de commit.

## Exemplos

Para uma solicitacao em portugues:

```text
fix(cache): evita reutilizar respostas expiradas

Renova a consulta quando o prazo de validade termina.
```

Para uma solicitacao em ingles:

```text
feat(config)!: require the current configuration format

BREAKING CHANGE: migrate legacy configuration files before upgrading
```

## Conferencia

Confira sintaxe, classificacao, agrupamento, idioma inferido, ASCII e quebras de compatibilidade. Nao reproduza senhas, tokens, chaves, credenciais ou dados pessoais sensiveis; descreva essas alteracoes sem expor valores. Para a entrega final, siga [commit-output-rules.md](commit-output-rules.md).
