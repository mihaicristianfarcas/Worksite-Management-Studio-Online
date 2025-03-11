import PageWrapper from '@/components/page-wrapper'
import { WorkersDataTable } from '@/components/workers-table'
import { Button } from '@/components/ui/button'
import { useState } from 'react'

export default function Workers() {
  const [functionality, setFunctionality] = useState('')

  return (
    <PageWrapper pageTitle='Workers' className='mx-auto w-11/12'>
      <div>
        <WorkersDataTable />
      </div>
      <div className='flex flex-row items-start gap-4'>
        <Button onClick={() => setFunctionality('add')}>Add Worker</Button>
        <Button onClick={() => setFunctionality('delete')}>
          Delete Worker
        </Button>
      </div>
      <section>
        <div className='flex flex-col'>
          {functionality === 'add' && (
            <>
              <h2>Add Worker</h2>
              <form>
                <label>
                  Name:
                  <input type='text' />
                </label>
                <label>
                  Email:
                  <input type='email' />
                </label>
                <label>
                  Phone:
                  <input type='tel' />
                </label>
                <label>
                  Role:
                  <input type='text' />
                </label>
                <Button type='submit'>Submit</Button>
              </form>
            </>
          )}
          {functionality === 'delete' && (
            <>
              <h2>Delete Worker</h2>
              <form>
                <label>
                  Name:
                  <input type='text' />
                </label>
                <label>
                  Email:
                  <input type='email' />
                </label>
                <label>
                  Phone:
                  <input type='tel' />
                </label>
                <label>
                  Role:
                  <input type='text' />
                </label>
                <Button type='submit'>Submit</Button>
              </form>
            </>
          )}
        </div>
      </section>
    </PageWrapper>
  )
}
