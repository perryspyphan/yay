export interface EmployeeDTO {
  id: string
  name: string
  phone: string | null
  birthday: string | null
  position: string | null
  staff_id: string | null
  created_at: string
}

export interface AddEmployeeDTO {
  name: string
  phone: string
  birthday: string
  position: string
}

export interface AccountDTO {
  id: string
  name: string
  email: string
  role: 'admin' | 'staff'
  auth_id: string | null
  employee_id: string | null
  created_at: string
}

export interface AddAccountDTO {
  name: string
  email: string
  role: 'admin' | 'staff'
  employee_id: string
}

export interface UpdateAccountDTO {
  name: string
  email: string
  role: 'admin' | 'staff'
}