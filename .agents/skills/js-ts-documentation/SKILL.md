---
name: js-ts-documentation
description: 'Crie ou revise documentação de código JavaScript e TypeScript, incluindo comentários JSDoc e TSDoc, APIs exportadas, funções, tipos, hooks e comportamentos não evidentes pelo código.'
---

Seu objetivo é aplicar as melhores práticas de documentação em JavaScript e TypeScript.

## Quando Documentar

- Considere públicas as APIs exportadas, hooks, tipos e contratos consumidos fora do módulo.
- Documente APIs públicas ou compartilhadas quando intenção, contrato ou comportamento não forem suficientemente claros pelo código e pelos tipos.
- Documente código interno quando houver comportamento não óbvio, restrições, invariantes ou decisões relevantes.
- Não adicione comentários que apenas repitam nomes, tipos ou implementação.

## Comentários

- Use comentários `/** ... */` para documentação estruturada.
- Use o primeiro parágrafo como descrição breve da responsabilidade ou comportamento.
- Use `@remarks` para contexto, restrições ou detalhes adicionais relevantes.
- Use Markdown para código, listas e formatação.
- Use `{@link Symbol}` para referências inline e `@see` para referências relacionadas.

## Funções e Métodos

- Use `@param` quando for necessário explicar significado, restrições ou comportamento de um parâmetro.
- Use `@typeParam` em TSDoc e `@template` em JSDoc quando parâmetros genéricos exigirem contexto adicional.
- Use `@returns` para explicar a semântica do resultado quando ela não for evidente pela assinatura.
- Use `@throws` apenas para erros realmente lançados e relevantes para o contrato esperado da API.
- Não repita tipos na documentação quando já estiverem expressos pelo TypeScript.

## Tipos, Classes e Propriedades

- Documente tipos e classes quando sua responsabilidade ou regras não forem evidentes.
- Documente propriedades apenas quando houver semântica, restrições ou comportamento relevante além do tipo e do nome.
- Não use descrições artificiais como "Obtém..." ou "Define..." quando elas apenas repetirem a declaração.
- Documente construtores somente quando seus parâmetros, efeitos ou restrições exigirem contexto adicional.

## Exemplos

- Use `@example` quando um exemplo tornar o contrato ou uso significativamente mais claro.
- Use blocos Markdown com `ts` ou `js` para exemplos de código.
- Mantenha exemplos pequenos e focados no comportamento documentado.

## Evolução de APIs

- Use `@deprecated` para APIs que não devem mais ser utilizadas e indique a alternativa quando existir.
- Use `{@inheritDoc}` somente quando a ferramenta adotada suportar a tag e a documentação herdada representar corretamente o comportamento.
- Documente diferenças quando uma implementação alterar significativamente o contrato herdado.

## Princípios

- Documente intenção, contrato e decisões relevantes, não a implementação linha a linha.
- Prefira código e tipos claros a comentários usados para compensar código difícil de entender.
- Evite documentação especulativa sobre comportamentos futuros.
- Mantenha a documentação consistente com o comportamento atual do código.
- Prefira nenhuma documentação a documentação trivial, redundante ou incorreta.

## Revisão

- Confirme se a documentação é necessária antes de adicioná-la.
- Registre intenção, contrato, restrições e invariantes não evidentes; não descreva a implementação linha a linha.
- Verifique se tags, links e exemplos correspondem ao código e aos tipos atuais.
