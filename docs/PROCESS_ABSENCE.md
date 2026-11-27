# Ausência declarada de processo

Integração da [história frontend #181](https://github.com/CS-PI-2026-Integrados/front-end/issues/181) com o backend #72 (commit 9a85f56).

## Decisões aprovadas

- O documento exibe apenas `-` para ausência declarada. Não é criado número ou processo fictício.
- A declaração exige ausência de todos os vínculos, inclusive processos inativos.
- Marcar o checkbox não remove nem encerra processos, nem inativa o apenado.
- Falha ao carregar o cadastro ou pesquisar processos é erro; não é uma declaração de ausência.

## Contrato e fluxo

A interface usa `noProcessDeclared`; os services convertem para `no_process_declared`.
No cadastro e na edição, o operador seleciona processos ou declara a ausência explicitamente.
Na conferência do atendimento, a declaração persistida é carregada do detalhe completo do apenado.
Um cadastro antigo sem vínculos e sem declaração permanece desmarcado até a escolha explícita do operador.

O multipart `POST /attendance` envia `no_process_declared: true` e `process_id: null` quando declarada a ausência.
Sem essa declaração, exige processo ativo vinculado. Endereço, situação trabalhista, foto cadastral e evidência do atendimento continuam validados.
A API valida comarca, vínculos e consistência, inclusive se os dados mudarem após o carregamento da interface.

As respostas podem omitir os campos nulos de processo. O frontend mantém a ausência no modelo e exibe `-` somente na apresentação.
O histórico usa a declaração do atendimento, sem inferi-la dos vínculos atuais do apenado.
PDFs oficiais são obtidos pelo endpoint existente; o frontend não gera substitutos.

## Reutilização e publicação

A inclusão e o vínculo posterior reutilizam `ProcessSelector`, `useProcessCreation` e `processService`, relacionados à [#79](https://github.com/CS-PI-2026-Integrados/front-end/issues/79) e à [#198](https://github.com/CS-PI-2026-Integrados/front-end/issues/198).
Para adicionar processo posteriormente, desmarque a declaração e use o seletor do cadastro existente.
O vínculo limpa a declaração cadastral; os atendimentos e documentos anteriores permanecem como emitidos.

Publicar em conjunto com o backend #72 e aplicar `db/declared-process-absence.sql` antes da publicação da API.
Validação local: lint, build e fluxo completo no navegador com API e H2 temporários, com e sem processo, incluindo comparação SHA-256 do PDF anterior ao vínculo.
