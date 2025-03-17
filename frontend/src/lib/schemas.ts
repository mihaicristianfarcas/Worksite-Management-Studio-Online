import { z } from 'zod'

// id: 'fafwe9f9',
// name: 'Sica',
// age: 17,
// position: 'Cu roaba',
// salary: 1000

export const WorkerSchema = z.object({
  id: z.string().min(1, { message: 'ID is required.' }),
  name: z
    .string()
    .min(1, { message: 'Name is required.' })
    .min(2, { message: 'Name must be at least 2 characters.' }),
  age: z.coerce
    .number()
    .min(1, { message: 'Age is required.' })
    .int({ message: 'Age must be an integer.' }),
  position: z.string().min(1, { message: 'Position is required.' }),
  salary: z.coerce.number().min(1, { message: 'Salary is required.' })
})
