import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { vi } from 'vitest'
import { WorkersDataTable } from '../workers-table'
import '@testing-library/jest-dom'

// Mock clipboard API
Object.assign(navigator, {
  clipboard: {
    writeText: vi.fn()
  }
})

// Mock toast for WorkersDataTable tests too (if it uses toast)
vi.mock('sonner', () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn()
  }
}))

describe('WorkersDataTable', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  test('should display workers data', () => {
    render(<WorkersDataTable />)

    // Check if some initial workers are displayed
    expect(screen.getByText('Dorel')).toBeInTheDocument()
    expect(screen.getByText('Sica')).toBeInTheDocument()
  })

  test('should add a new worker successfully', async () => {
    const user = userEvent.setup()
    render(<WorkersDataTable />)

    // Open add worker dialog
    const addButton = screen.getByText('Add Worker')
    await user.click(addButton)

    // Fill the form
    const nameInput = screen.getByPlaceholderText('Name')
    const ageInput = screen.getByPlaceholderText('Age')
    const positionInput = screen.getByPlaceholderText('Position')
    const salaryInput = screen.getByPlaceholderText('Salary')

    await user.type(nameInput, 'Test Worker')
    await user.type(ageInput, '30')
    await user.type(positionInput, 'Tester')
    await user.type(salaryInput, '3000')

    // Submit the form
    const submitButton = screen.getByText('Proceed')
    await user.click(submitButton)

    // Check if the new worker appears in the table
    await waitFor(() => {
      expect(screen.getByText('Test Worker')).toBeInTheDocument()
      expect(screen.getByText('Tester')).toBeInTheDocument()
    })
  })

  test('should delete selected workers', async () => {
    const user = userEvent.setup()
    render(<WorkersDataTable />)

    // Get initial count of workers
    const initialRows = screen.getAllByRole('row').length - 1 // Subtract header row

    // Select the first worker's checkbox
    const checkboxes = screen.getAllByRole('checkbox')
    // Skip the header checkbox (index 0) and select the first row checkbox (index 1)
    await user.click(checkboxes[1])

    // Check if delete button appears and shows correct count
    const deleteButton = screen.getByText(/Delete Selected \(1\)/)
    expect(deleteButton).toBeInTheDocument()

    // Click delete button
    await user.click(deleteButton)

    // Verify worker was deleted
    const newRowCount = screen.getAllByRole('row').length - 1
    expect(newRowCount).toBe(initialRows - 1)
  })

  test('should filter workers by name', async () => {
    const user = userEvent.setup()
    render(<WorkersDataTable />)

    // Type in the search input
    const searchInput = screen.getByPlaceholderText('Search workers...')
    await user.type(searchInput, 'Dorel')

    // Verify only matching workers are shown
    expect(screen.getByText('Dorel')).toBeInTheDocument()
    expect(screen.queryByText('Sica')).not.toBeInTheDocument()
  })
})
