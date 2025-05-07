import { z } from 'zod'
import { SubmitHandler, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { ProjectSchema } from '@/lib/schemas'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Calendar } from '@/components/ui/calendar'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { Project } from '@/services/types'
import { useState } from 'react'
import { format } from 'date-fns'

type ProjectFormValues = z.infer<typeof ProjectSchema>

interface EditProjectFormProps {
  project: Project
  onEditProject: (project: Project) => void
}

export default function EditProjectForm({ project, onEditProject }: EditProjectFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(
    project.start_date ? new Date(project.start_date) : undefined
  )
  const [endDate, setEndDate] = useState<Date | undefined>(
    project.end_date ? new Date(project.end_date) : undefined
  )

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
      start_date: project.start_date || '',
      end_date: project.end_date || '',
      latitude: project.latitude || 0,
      longitude: project.longitude || 0,
      created_at: project.created_at,
      updated_at: project.updated_at,
      deleted_at: project.deleted_at
    }
  })

  const onSubmit: SubmitHandler<ProjectFormValues> = async data => {
    try {
      const formattedData = {
        ...data,
        start_date: startDate ? startDate.toISOString() : undefined,
        end_date: endDate ? endDate.toISOString() : undefined
      }

      console.log('Submitting project update:', formattedData)
      onEditProject({
        ...project,
        ...formattedData
      } as Project)
    } catch (error) {
      console.error('Error formatting project data:', error)
      throw error
    }
  }

  const handleStatusChange = (value: 'active' | 'completed' | 'on_hold' | 'cancelled') => {
    setValue('status', value)
  }

  const handleStartDateChange = (date: Date | undefined) => {
    setStartDate(date)
    setValue('start_date', date ? date.toISOString() : '')
  }

  const handleEndDateChange = (date: Date | undefined) => {
    setEndDate(date)
    setValue('end_date', date ? date.toISOString() : '')
  }

  return (
    <section className='relative isolate z-0'>
      <form onSubmit={handleSubmit(onSubmit)} className='mt-4 space-y-6 lg:flex-auto' noValidate>
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
            <label className='mb-1 block text-sm font-medium'>Start Date</label>
            <Calendar
              mode='single'
              selected={startDate}
              onSelect={handleStartDateChange}
              initialFocus
            />
            {startDate && (
              <p className='ml-1 mt-1 text-xs text-gray-500'>
                Selected: {format(startDate, 'PPP')}
              </p>
            )}
            {errors.start_date?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.start_date.message}</p>
            )}
          </div>

          {/* End Date */}
          <div>
            <label className='mb-1 block text-sm font-medium'>End Date</label>
            <Calendar
              mode='single'
              selected={endDate}
              onSelect={handleEndDateChange}
              initialFocus
            />
            {endDate && (
              <p className='ml-1 mt-1 text-xs text-gray-500'>Selected: {format(endDate, 'PPP')}</p>
            )}
            {errors.end_date?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.end_date.message}</p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <Input
              id='latitude'
              type='number'
              step='any'
              placeholder='Latitude'
              {...register('latitude', { valueAsNumber: true })}
            />
            {errors.latitude?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.latitude.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>Enter latitude (-90 to 90)</p>
          </div>

          {/* Longitude */}
          <div>
            <Input
              id='longitude'
              type='number'
              step='any'
              placeholder='Longitude'
              {...register('longitude', { valueAsNumber: true })}
            />
            {errors.longitude?.message && (
              <p className='ml-1 mt-2 text-sm text-rose-400'>{errors.longitude.message}</p>
            )}
            <p className='ml-1 mt-1 text-xs text-gray-500'>Enter longitude (-180 to 180)</p>
          </div>
        </div>

        {/* Description - Full Width */}
        <div>
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
        <Button className='w-full' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </Button>
      </form>
    </section>
  )
}
