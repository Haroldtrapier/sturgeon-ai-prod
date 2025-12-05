export interface SearchParams {
  query: string
  naics?: string
}

export interface SearchResult {
  id: string
  title: string
  description: string
  naics?: string
  marketplace: 'sam' | 'govwin' | 'govspend'
}
