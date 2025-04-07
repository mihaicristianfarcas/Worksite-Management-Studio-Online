import PageTitle from '@/components/page-title'
import { WorkersAgeBarChart } from '@/components/workers/age-bar-chart'
import { WorkersSalaryPieChart } from '@/components/workers/salary-pie-chart'

export default function Dashboard() {
  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <section className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
        <WorkersSalaryPieChart />
        <WorkersAgeBarChart />
      </section>
    </>
  )
}
