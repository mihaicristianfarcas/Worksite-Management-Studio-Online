import { AdminDataTable } from '@/components/admin/main-data-table'
import PageTitle from '@/components/page-title'

const Admin = () => {
  return (
    <div className='container py-10'>
      <PageTitle>Admin Dashboard</PageTitle>
      <AdminDataTable />
    </div>
  )
}

export default Admin
