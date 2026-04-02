import { getEmployeesUseCase } from '@/application/use-cases/staff/StaffUseCases'
import EmployeeTable from '@/presentation/components/employee/EmployeeTable'

export const dynamic = 'force-dynamic'

export default async function NhanVienPage() {
  const employees = await getEmployeesUseCase()
  return <EmployeeTable initialEmployees={employees} />
}