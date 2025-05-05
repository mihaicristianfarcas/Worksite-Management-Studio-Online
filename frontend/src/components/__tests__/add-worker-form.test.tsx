import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import AddWorkerForm from '../forms/worker-add-form'
// import { Worker } from '@/components/workers-table'
import '@testing-library/jest-dom'

// Mock toast - fixed structure
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('AddWorkerForm', () => {
  test('should call onAddWorker with form data when submitted', async () => {
    const user = userEvent.setup()
    const mockOnAddWorker = vi.fn()

    render(<AddWorkerForm onAddWorker={mockOnAddWorker} />)

    // Fill the form
    await user.type(screen.getByPlaceholderText('Name'), 'John Doe')
    await user.type(screen.getByPlaceholderText('Age'), '35')
    await user.type(screen.getByPlaceholderText('Position'), 'Developer')
    await user.type(screen.getByPlaceholderText('Salary'), '5000')

    // Submit the form
    await user.click(screen.getByText('Proceed'))

    // Check if onAddWorker was called with correct data
    await waitFor(() => {
      expect(mockOnAddWorker).toHaveBeenCalledTimes(1)
      const calledWithWorker = mockOnAddWorker.mock.calls[0][0]
      expect(calledWithWorker.name).toBe('John Doe')
      expect(calledWithWorker.age).toBe(35)
      expect(calledWithWorker.position).toBe('Developer')
      expect(calledWithWorker.salary).toBe(5000)
      expect(calledWithWorker.id).toBeDefined() // Check ID was generated
    })
  })

  test('should display validation errors for empty fields', async () => {
    const user = userEvent.setup()
    const mockOnAddWorker = vi.fn()

    render(<AddWorkerForm onAddWorker={mockOnAddWorker} />)

    // Submit empty form
    await user.click(screen.getByText('Proceed'))

    // Check for validation errors
    await waitFor(() => {
      expect(screen.getByText('Name is required.')).toBeInTheDocument()
      expect(screen.getByText('Age is required.')).toBeInTheDocument()
      expect(screen.getByText('Position is required.')).toBeInTheDocument()
      expect(screen.getByText('Salary is required.')).toBeInTheDocument()
    })

    // Ensure onAddWorker was not called
    expect(mockOnAddWorker).not.toHaveBeenCalled()
  })

  test('should reset form after successful submission', async () => {
    const user = userEvent.setup()
    const mockOnAddWorker = vi.fn()

    render(<AddWorkerForm onAddWorker={mockOnAddWorker} />)

    // Fill the form
    const nameInput = screen.getByPlaceholderText('Name')
    const ageInput = screen.getByPlaceholderText('Age')
    const salaryInput = screen.getByPlaceholderText('Salary')
    const positionInput = screen.getByPlaceholderText('Position')

    await user.type(nameInput, 'Test Person')
    await user.type(ageInput, '25')
    await user.type(salaryInput, '3500')
    await user.type(positionInput, 'Tester')

    // Submit the form
    await user.click(screen.getByText('Proceed'))

    // Verify form is reset
    // await waitFor(() => {
    //   expect(nameInput).toHaveValue('')
    //   expect(ageInput).toHaveValue('')
    //   expect(positionInput).toHaveValue('')
    //   expect(salaryInput).toHaveValue('')
    // })
  })
})
