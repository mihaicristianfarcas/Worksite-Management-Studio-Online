import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectSchema } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Project } from '@/api/projects-api'

type ProjectFormValues = z.infer<typeof ProjectSchema>

interface EditProjectFormProps {
  project: Project
  onEditProject: (project: Project) => void
}

export default function EditProjectForm({ project, onEditProject }: EditProjectFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      id: project.id,
      name: project.name,
      description: project.description,
      status: project.status as 'active' | 'completed' | 'on_hold' | 'cancelled',
      start_date: project.start_date
        ? new Date(project.start_date).toISOString().split('T')[0]
        : '',
      end_date: project.end_date ? new Date(project.end_date).toISOString().split('T')[0] : '',
      created_at: project.created_at,
      updated_at: project.updated_at,
      deleted_at: project.deleted_at
    }
  })

  const onSubmit: SubmitHandler<ProjectFormValues> = async data => {
    try {
      // Convert dates to ISO strings with time set to midnight UTC
      const formattedData = {
        ...data,
        start_date: new Date(data.start_date + 'T00:00:00Z').toISOString(),
        end_date: data.end_date ? new Date(data.end_date + 'T00:00:00Z').toISOString() : undefined
      }

      console.log('Submitting project update:', formattedData)
      onEditProject({
        ...project,
        ...formattedData
      })
    } catch (error) {
      console.error('Error formatting project data:', error)
      throw error
    }
  }

  // We need this for the select component since it can't directly use register
  const handleStatusChange = (value: 'active' | 'completed' | 'on_hold' | 'cancelled') => {
    setValue('status', value)
  }

  return (
    <section className='relative isolate'>
      <form onSubmit={handleSubmit(onSubmit)} className='mt-4 lg:flex-auto' noValidate>
        <div className='grid grid-cols-1 gap-4 sm:grid-cols-2'>
          {/* Name */}
          <div>
            <Input id='name' type='text' placeholder='Project name' {...register('name')} />
            {errors.name?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.name.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>
              Enter the project name (2-100 characters)
            </p>
          </div>

          {/* Status */}
          <div>
            <Select onValueChange={handleStatusChange} defaultValue={watch('status')}>
              <SelectTrigger>
                <SelectValue placeholder='Select project status' />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='active'>Active</SelectItem>
                <SelectItem value='completed'>Completed</SelectItem>
                <SelectItem value='on_hold'>On Hold</SelectItem>
                <SelectItem value='cancelled'>Cancelled</SelectItem>
              </SelectContent>
            </Select>
            {errors.status?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.status.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>Select the current project status</p>
          </div>

          {/* Start Date */}
          <div>
            <Input id='start_date' type='date' {...register('start_date')} />
            {errors.start_date?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.start_date.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>Select the project start date</p>
          </div>

          {/* End Date */}
          <div>
            <Input
              id='end_date'
              type='date'
              {...register('end_date')}
              value={watch('end_date') || ''}
              onChange={e => setValue('end_date', e.target.value || undefined)}
            />
            {errors.end_date?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.end_date.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>
              Select the project end date (if known)
            </p>
          </div>
        </div>

        {/* Description - Full Width */}
        <div className='mt-4'>
          <Textarea
            id='description'
            placeholder='Project description'
            className='min-h-24'
            {...register('description')}
          />
          {errors.description?.message && (
            <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.description.message}</p>
          )}
          <p className='ml-1 mt-1 text-xs text-gray-500'>
            Enter a detailed project description (10-500 characters)
          </p>
        </div>

        {/* Submit */}
        <Button className='mt-4 w-full' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </Button>
      </form>
    </section>
  )
}
