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
import { format } from 'date-fns'
import { useState } from 'react'

type ProjectFormValues = z.infer<typeof ProjectSchema>

interface AddProjectFormProps {
  onAddProject: (
    project: Omit<ProjectFormValues, 'id' | 'created_at' | 'updated_at' | 'deleted_at'>
  ) => void
}

export default function AddProjectForm({ onAddProject }: AddProjectFormProps) {
  const [startDate, setStartDate] = useState<Date | undefined>(new Date())
  const [endDate, setEndDate] = useState<Date | undefined>(undefined)

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
    setValue,
    watch
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(ProjectSchema),
    defaultValues: {
      name: '',
      description: '',
      status: 'active',
      start_date: new Date().toISOString(),
      end_date: undefined,
      latitude: 0,
      longitude: 0
    }
  })

  const onSubmit: SubmitHandler<ProjectFormValues> = async data => {
    try {
      const formattedData = {
        ...data,
        start_date: startDate ? startDate.toISOString() : new Date().toISOString(),
        end_date: endDate ? endDate.toISOString() : undefined,
        latitude: Number(data.latitude),
        longitude: Number(data.longitude)
      }

      onAddProject(formattedData)
      reset()
      setStartDate(new Date())
      setEndDate(undefined)
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
            <Input
              id='name'
              type='text'
              required
              placeholder='Project name'
              aria-invalid={!!errors.name}
              aria-describedby='name-error name-hint'
              {...register('name')}
            />
            {errors.name?.message && (
              <p id='name-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.name.message}
              </p>
            )}
            <p id='name-hint' className='ml-1 mt-1 text-xs text-gray-500'>
              Enter the project name (2–100 characters)
            </p>
          </div>

          {/* Status */}
          <div>
            <Select onValueChange={handleStatusChange} defaultValue={watch('status')}>
              <SelectTrigger
                id='status'
                aria-invalid={!!errors.status}
                aria-describedby='status-error status-hint'
              >
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
              <p id='status-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.status.message}
              </p>
            )}
            <p id='status-hint' className='ml-1 mt-1 text-xs text-gray-500'>
              Select the current project status
            </p>
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
              <p id='start_date-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.start_date.message}
              </p>
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
              <p id='end_date-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.end_date.message}
              </p>
            )}
          </div>

          {/* Latitude */}
          <div>
            <Input
              id='latitude'
              type='number'
              step='any'
              required
              placeholder='Latitude'
              aria-describedby='latitude-error latitude-hint'
              aria-invalid={!!errors.latitude}
              {...register('latitude', { valueAsNumber: true })}
            />
            {errors.latitude?.message && (
              <p id='latitude-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.latitude.message}
              </p>
            )}
            <p id='latitude-hint' className='ml-1 mt-1 text-xs text-gray-500'>
              Enter latitude (-90 to 90)
            </p>
          </div>

          {/* Longitude */}
          <div>
            <Input
              id='longitude'
              type='number'
              step='any'
              required
              placeholder='Longitude'
              aria-describedby='longitude-error longitude-hint'
              aria-invalid={!!errors.longitude}
              {...register('longitude', { valueAsNumber: true })}
            />
            {errors.longitude?.message && (
              <p id='longitude-error' className='ml-1 mt-2 text-sm text-rose-400'>
                {errors.longitude.message}
              </p>
            )}
            <p id='longitude-hint' className='ml-1 mt-1 text-xs text-gray-500'>
              Enter longitude (-180 to 180)
            </p>
          </div>
        </div>

        {/* Description */}
        <div>
          <Textarea
            id='description'
            required
            aria-invalid={!!errors.description}
            aria-describedby='description-error description-hint'
            placeholder='Project description'
            className='min-h-24'
            {...register('description')}
          />
          {errors.description?.message && (
            <p id='description-error' className='ml-1 mt-2 text-sm text-rose-400'>
              {errors.description.message}
            </p>
          )}
          <p id='description-hint' className='ml-1 mt-1 text-xs text-gray-500'>
            Enter a detailed project description (10–500 characters)
          </p>
        </div>

        {/* Submit */}
        <Button className='w-full' type='submit' disabled={isSubmitting}>
          {isSubmitting ? 'Adding...' : 'Add Project'}
        </Button>
      </form>
    </section>
  )
}
