import PageTitle from '@/components/page-title'
import { WorkersAgeBarChart } from '@/components/workers/age-bar-chart'
import { WorkersSalaryPieChart } from '@/components/workers/salary-pie-chart'
import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])

  return (
    <>
      <PageTitle title='Dashboard' />
      <section className='grid grid-cols-2 gap-4 lg:grid-cols-3'>
        <WorkersSalaryPieChart />
        <WorkersAgeBarChart />
        <WorkersAgeBarChart />
      </section>
      <h1 className='text-2xl font-bold'>Hello from the backend:</h1>
      <p>{message}</p>
    </>
  )
}
