import { z } from 'zod'

// id: 'fafwe9f9',
// name: 'Sica',
// age: 17,
// position: 'Cu roaba',
// salary: 1000

export const WorkerSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(50, { message: 'Name must be at most 50 characters.' }),
  age: z.coerce
    .number()
    .min(18, { message: 'Age must be at least 18.' })
    .max(100, { message: 'Age must be at most 100.' })
    .int({ message: 'Age must be an integer.' }),
  position: z
    .string()
    .min(2, { message: 'Position must be at least 2 characters.' })
    .max(50, { message: 'Position must be at most 50 characters.' }),
  salary: z.coerce
    .number()
    .min(0, { message: 'Salary must be at least 0.' })
    .int({ message: 'Salary must be an integer.' })
})

export const ProjectSchema = z.object({
  name: z
    .string()
    .min(2, { message: 'Name must be at least 2 characters.' })
    .max(100, { message: 'Name must be at most 100 characters.' }),
  description: z
    .string()
    .min(10, { message: 'Description must be at least 10 characters.' })
    .max(500, { message: 'Description must be at most 500 characters.' }),
  status: z.enum(['active', 'completed', 'on_hold', 'cancelled'], {
    errorMap: () => ({ message: 'Status must be one of: active, completed, on_hold, cancelled' })
  }),
  start_date: z.string().transform(str => new Date(str)),
  end_date: z
    .string()
    .optional()
    .transform(str => (str ? new Date(str) : undefined))
})
