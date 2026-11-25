import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { Pagination } from './pagination'

const renderPagination = (currentPage, totalPages) =>
  renderToStaticMarkup(
    <Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={() => {}} />
  )

describe('Pagination', () => {
  it('limits visible page numbers and uses ellipses for large page counts', () => {
    const markup = renderPagination(50, 100)
    const visiblePageNumbers = markup.match(/aria-label="Ir para a página \d+"/g)

    expect(visiblePageNumbers).toHaveLength(5)
    expect(markup).toContain('aria-label="Ir para a página 1"')
    expect(markup).toContain('aria-label="Ir para a página 49"')
    expect(markup).toContain('aria-label="Ir para a página 50"')
    expect(markup).toContain('aria-label="Ir para a página 51"')
    expect(markup).toContain('aria-label="Ir para a página 100"')
    expect(markup.match(/<svg/g)).toHaveLength(4)
  })

  it('shows nearby pages at the beginning and end without an expanding number list', () => {
    const firstPageMarkup = renderPagination(1, 100)
    const lastPageMarkup = renderPagination(100, 100)

    expect(firstPageMarkup).toContain('aria-label="Ir para a página 2"')
    expect(firstPageMarkup).toContain('aria-label="Ir para a página 3"')
    expect(lastPageMarkup).toContain('aria-label="Ir para a página 98"')
    expect(lastPageMarkup).toContain('aria-label="Ir para a página 99"')
    expect(lastPageMarkup).toContain('aria-label="Ir para a página 100"')
  })
})
