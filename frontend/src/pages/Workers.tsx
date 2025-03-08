import PageWrapper from '@/components/page-wrapper'
import { WorkersDataTable } from '@/components/workers-table'

export default function Workers() {
  return (
    <PageWrapper pageTitle='Workers'>
      <WorkersDataTable />
    </PageWrapper>
  )
}
