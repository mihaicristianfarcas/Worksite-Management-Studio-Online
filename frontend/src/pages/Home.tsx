import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('')
  useEffect(() => {
    fetch('/api/hello')
      .then(res => res.json())
      .then(data => setMessage(data.message))
  }, [])

  return (
    <div className='flex h-full flex-col items-center justify-center space-y-4'>
      <h1>Work in progress...</h1>
      <p className='mt-4 text-lg'>{message || 'Loading...'} from backend</p>
    </div>
  )
}
