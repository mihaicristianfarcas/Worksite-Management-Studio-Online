import PageTitle from '@/components/page-title'
import { WorkersDataTable } from '@/components/workers-data-table'
import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])

  return (
    <>
      <PageTitle title='Welcome back, User' />
      <WorkersDataTable />
      <p>{message}</p>
    </>
  )
}
