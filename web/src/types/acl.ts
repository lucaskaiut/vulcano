export type Permission = {
  id: number
  name: string
  slug: string
  description: string | null
}

export type Role = {
  id: number
  name: string
  description: string | null
  permission_slugs: string[]
}

export type UserManager = {
  id: number
  name: string
  job_title: string
}

export type SalaryHistoryChangedBy = {
  id: number
  name: string
  job_title: string
}

export type SalaryHistory = {
  id: number
  previous_salary: string | null
  new_salary: string
  effective_date: string
  notes: string | null
  changed_by?: SalaryHistoryChangedBy | null
  created_at: string
  updated_at: string
}

export type Sector = {
  id: number
  name: string
}

export type Benefit = {
  id?: number
  name: string
  price: number | string
}

export type AclUser = {
  id: number
  name: string
  job_title: string
  hired_at: string
  manager_id: number | null
  manager?: UserManager | null
  sector_id: number | null
  sector?: Sector | null
  salary: string
  email: string
  email_verified_at: string | null
  company_name: string | null
  cnpj: string | null
  cpf: string | null
  rg: string | null
  birth_date: string | null
  phone: string | null
  zip_code: string | null
  street: string | null
  number: string | null
  neighborhood: string | null
  city: string | null
  state: string | null
  contract_type: string | null
  contracting_company: string | null
  invoice_due_day: number | null
  emergency_contacts: string | null
  bank_details: string | null
  observations: string | null
  benefits?: Benefit[]
  roles?: Role[]
}

export type PaginatedMeta = {
  current_page: number
  last_page: number
  per_page: number
  total: number
  sort?: string
  direction?: 'asc' | 'desc'
}

export type PaginatedResponse<T> = {
  data: T[]
  meta: PaginatedMeta
}

export type MessageResponse = {
  message: string
}

export type ItemResponse<T> = {
  data: T
  message?: string
}
