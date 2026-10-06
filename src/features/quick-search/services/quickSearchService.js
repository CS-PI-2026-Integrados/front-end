import { searchConvicteds } from '@/features/convicteds'

const toSearchResult = (person) => ({
  id: person.id,
  fullName: person.fullName,
  cpf: person.cpf,
  photoUrl: person.photoUrl,
  processNumber: person.mainProcessNumber || '',
})

export async function searchPeople({ query, limit = 10, signal } = {}) {
  const term = query?.trim()
  if (!term) return []

  const people = await searchConvicteds({ search: term, limit, signal })
  return people.map(toSearchResult)
}
