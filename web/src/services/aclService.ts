import { apiFetch } from './api'
import type {
  AclUser,
  ItemResponse,
  MessageResponse,
  PaginatedResponse,
  Permission,
  Role,
  SalaryHistory,
} from '../types/acl'
import type { UserListFilters } from '../lib/userFilters'
import type { AllowedPerPage, TableSort } from '../types/preferences'

export type { UserListFilters } from '../lib/userFilters'

type ListParams = {
  sort?: string
  page?: number
  per_page?: AllowedPerPage
  filters?: UserListFilters
}

function buildQuery(params?: ListParams): string {
  if (!params) {
    return ''
  }

  const query = new URLSearchParams()

  if (params.sort) {
    query.set('sort', params.sort)
  }

  if (params.page !== undefined) {
    query.set('page', String(params.page))
  }

  if (params.per_page !== undefined) {
    query.set('per_page', String(params.per_page))
  }

  if (params.filters) {
    for (const [key, value] of Object.entries(params.filters)) {
      if (value !== undefined && value !== '') {
        query.set(key, String(value))
      }
    }
  }

  const queryString = query.toString()

  return queryString ? `?${queryString}` : ''
}

function buildSortParam(sorts: TableSort[]): string | undefined {
  if (sorts.length === 0) {
    return undefined
  }

  return sorts.map((sort) => `${sort.column}:${sort.direction}`).join(',')
}

export type ListQueryParams = {
  sorts?: TableSort[]
  page?: number
  per_page?: AllowedPerPage
  filters?: UserListFilters
}

function buildListQuery({ sorts = [], page, per_page, filters }: ListQueryParams = {}): string {
  return buildQuery({
    sort: buildSortParam(sorts),
    page,
    per_page,
    filters,
  })
}

export async function listUsers(params: ListQueryParams = {}): Promise<PaginatedResponse<AclUser>> {
  return apiFetch<PaginatedResponse<AclUser>>(`/users${buildListQuery(params)}`)
}

export async function getUser(id: number): Promise<AclUser> {
  const response = await apiFetch<ItemResponse<AclUser>>(`/users/${id}`)
  return response.data
}

export async function createUser(payload: {
  name: string
  job_title: string
  hired_at: string
  manager_id?: number | null
  salary: number
  email: string
  password: string
  role_ids?: number[]
}): Promise<AclUser> {
  const response = await apiFetch<ItemResponse<AclUser>>('/users', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateUser(
  id: number,
  payload: {
    name?: string
    job_title?: string
    hired_at?: string
    manager_id?: number | null
    salary?: number
    email?: string
    password?: string
    role_ids?: number[]
  },
): Promise<AclUser> {
  const response = await apiFetch<ItemResponse<AclUser>>(`/users/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteUser(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/users/${id}`, {
    method: 'DELETE',
  })
}

export async function listSalaryHistories(userId: number): Promise<SalaryHistory[]> {
  const response = await apiFetch<{ data: SalaryHistory[] }>(`/users/${userId}/salary-histories`)
  return response.data
}

export async function createSalaryHistory(
  userId: number,
  payload: {
    new_salary: number
    effective_date: string
    notes?: string
  },
): Promise<SalaryHistory> {
  const response = await apiFetch<ItemResponse<SalaryHistory>>(`/users/${userId}/salary-histories`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateSalaryHistory(
  userId: number,
  historyId: number,
  payload: {
    new_salary?: number
    effective_date?: string
    notes?: string | null
  },
): Promise<SalaryHistory> {
  const response = await apiFetch<ItemResponse<SalaryHistory>>(
    `/users/${userId}/salary-histories/${historyId}`,
    {
      method: 'PUT',
      body: JSON.stringify(payload),
    },
  )

  return response.data
}

export async function listRoles(params: ListQueryParams = {}): Promise<PaginatedResponse<Role>> {
  return apiFetch<PaginatedResponse<Role>>(`/roles${buildListQuery(params)}`)
}

export async function getRole(id: number): Promise<Role> {
  const response = await apiFetch<ItemResponse<Role>>(`/roles/${id}`)
  return response.data
}

export async function createRole(payload: {
  name: string
  description?: string
  permission_ids?: number[]
}): Promise<Role> {
  const response = await apiFetch<ItemResponse<Role>>('/roles', {
    method: 'POST',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function updateRole(
  id: number,
  payload: {
    name?: string
    description?: string
    permission_ids?: number[]
  },
): Promise<Role> {
  const response = await apiFetch<ItemResponse<Role>>(`/roles/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })

  return response.data
}

export async function deleteRole(id: number): Promise<void> {
  await apiFetch<MessageResponse>(`/roles/${id}`, {
    method: 'DELETE',
  })
}

export async function listPermissions(
  params: ListQueryParams = {},
): Promise<PaginatedResponse<Permission>> {
  return apiFetch<PaginatedResponse<Permission>>(`/permissions${buildListQuery(params)}`)
}
