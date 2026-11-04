# Análise integral das alterações pendentes

Estas instruções são comuns à geração de mensagens e à execução de commits.

## Escopo autorizado

Use o escopo explicitamente solicitado pelo usuário, como arquivos, trechos, uma correção ou apenas o índice. Sem restrição explícita, considere todas as alterações pendentes. A autoria ou a sessão de origem não constitui uma exclusão por si só.

Faça o inventário do repositório inteiro para distinguir alterações elegíveis, dependências e trabalho fora do escopo. Leia integralmente os diffs e arquivos novos elegíveis; consulte o conteúdo externo ao escopo quando necessário para compreender contratos ou separar alterações. O inventário global não autoriza incluir essas alterações nas mensagens ou nos commits.

Se o escopo não puder ser separado com segurança, explique o impedimento e prossiga nas partes independentes, sem ampliá-lo automaticamente. Preserve o conteúdo e a preparação das alterações excluídas.

## Inventário e leitura

Identifique a raiz com `git rev-parse --show-toplevel` e consulte o repositório inteiro, mesmo que o diretório atual seja uma subpasta:

- `git status --short --untracked-files=all`: arquivos pendentes, incluindo os novos.
- `git diff --cached`: conteúdo preparado para commit.
- `git diff`: conteúdo ainda não preparado.
- `git log` e `git show`: contexto histórico, quando necessário.

Registre todas as alterações pendentes no inventário e identifique quais pertencem ao escopo autorizado. Alterações já commitadas ou revertidas sem pendências ficam fora desse inventário.

Leia as duas camadas separadamente quando o mesmo arquivo estiver no índice e na árvore de trabalho. `git diff HEAD` não basta: diferenças dessas camadas podem se anular nessa comparação.

Leia o conteúdo dos arquivos novos, pois ele não aparece no diff. Considere adições, exclusões, renomeações, permissões, binários e referências de submódulos. Sem diff textual, descreva somente a mudança verificável.

Percorra todos os arquivos e trechos até o final. Se a ferramenta truncar a saída, continue por arquivo ou por partes. Não finalize a análise com base apenas em estatísticas, resumos ou amostras. Inclua comentários, espaços, quebras de linha, formatação e alterações na última linha do arquivo.

## Propósito e agrupamento

Identifique o problema corrigido, a funcionalidade adicionada ou a melhoria realizada. Consulte código relacionado, chamadas, testes e histórico quando necessário. Priorize o que mudou e por quê, sem inventar funcionalidades ou apenas listar arquivos e métodos.

Separe responsabilidades logicamente distintas, por exemplo:

- funcionalidade e uma suíte significativa de testes;
- correção e testes independentes;
- funcionalidade e documentação independente;
- refatoração e atualização de exemplos;
- código de produção e mudança independente de integração contínua ou compilação;
- alteração visual independente e correção de regra de negócio.

Trate testes e documentação como grupos próprios quando constituírem uma responsabilidade clara. Mantenha ajustes mínimos com o trabalho principal quando forem necessários ao mesmo objetivo e a separação não trouxer clareza. Não una responsabilidades independentes para reduzir a quantidade de mensagens nem divida artificialmente mudanças inseparáveis.

Associe cada alteração elegível a um grupo, inclusive as menores. Um arquivo pode contribuir com trechos para grupos diferentes ou conter trabalho fora do escopo. Cobertura integral exige representar todas as alterações autorizadas no conjunto de mensagens, sem enumerar cada linha no texto.

Quando a intenção não estiver clara, descreva o efeito verificável. Se ainda houver uma incerteza que impeça uma mensagem fundamentada, informe a limitação em vez de omitir a alteração ou inventar uma explicação. Não peça esclarecimentos triviais resolvíveis pela leitura do repositório.

Antes da entrega ou execução, confronte os grupos com o inventário e os diffs elegíveis completos para confirmar que nenhum trecho autorizado ficou sem cobertura e nenhum trecho excluído foi incluído. Diferencie ausência de alterações no escopo de ausência de alterações no repositório.
