export type PaginationParams = {
  page: number
  pageSize: number
  search?: string
}

export type PaginatedResponse<T> = {
  data: T[]
  total: number
  page: number
  pageSize: number
}
