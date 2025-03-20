import { z } from 'zod'
import { toast } from 'sonner'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { WorkerSchema } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Button } from './ui/button'
import { Worker } from '@/components/workers-table'

type WorkerFormInputs = z.infer<typeof WorkerSchema>

interface EditWorkerFormProps {
  worker: Worker
  onEditWorker: (worker: Worker) => void
}

export default function EditWorkerForm({
  worker,
  onEditWorker: onEditWorker
}: EditWorkerFormProps) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<WorkerFormInputs>({
    resolver: zodResolver(WorkerSchema),
    defaultValues: {
      name: worker.name,
      age: worker.age,
      position: worker.position,
      salary: worker.salary
    }
  })

  const onSubmit: SubmitHandler<WorkerFormInputs> = async data => {
    const newWorker = {
      id: worker.id,
      ...data
    }

    onEditWorker(newWorker)
    toast.success('Worker edited successfully!')
    reset()
  }

  // TODO add worker
  return (
    <section className='relative isolate'>
      <form onSubmit={handleSubmit(onSubmit)} className='mt-4 lg:flex-auto' noValidate>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Name */}
          <div>
            <Input
              id='name'
              type='text'
              placeholder='Name'
              autoComplete='given-name'
              {...register('name')}
            />

            {errors.name?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.name.message}</p>
            )}
          </div>

          {/* Age */}
          <div>
            <Input
              id='age'
              type='number'
              placeholder='Age'
              autoComplete='age'
              {...register('age')}
            />

            {errors.age?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.age.message}</p>
            )}
          </div>

          {/* Salary */}
          <div>
            <Input
              id='salary'
              type='number'
              placeholder='Salary'
              autoComplete='salary'
              {...register('salary')}
            />

            {errors.salary?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.salary.message}</p>
            )}
          </div>

          {/* Position */}
          <div>
            <Input
              id='position'
              type='text'
              placeholder='Position'
              autoComplete='position'
              {...register('position')}
            />

            {errors.position?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.position.message}</p>
            )}
          </div>
        </div>
        {/* Submit */}
        <Button className='mt-4 w-full' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Modifying...' : 'Proceed'}
        </Button>
      </form>
    </section>
  )
}
