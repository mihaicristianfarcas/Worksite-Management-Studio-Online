import PageTitle from '@/components/page-title'
import { WorkersAgeBarChart } from '@/components/workers/age-bar-chart'
import { WorkersSalaryPieChart } from '@/components/workers/salary-pie-chart'
import { WorkersPositionChart } from '@/components/workers/position-chart'

export default function Dashboard() {
  return (
    <>
      <PageTitle>Dashboard</PageTitle>
      <section className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
        <WorkersSalaryPieChart />
        <WorkersAgeBarChart />
        <WorkersPositionChart />
      </section>
    </>
  )
}
