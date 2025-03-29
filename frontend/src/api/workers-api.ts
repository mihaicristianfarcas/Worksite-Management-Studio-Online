// Type definitions and API service for workers
export type Worker = {
  id: string
  name: string
  age: number
  position: string
  salary: number
}

// API base URL - make sure this matches backend
const API_URL = 'http://localhost:8080/api'

// Workers API service
export const workersApi = {
  // Fetch all workers
  async getAll(): Promise<Worker[]> {
    const response = await fetch(`${API_URL}/workers`)
    if (!response.ok) {
      throw new Error('Failed to fetch workers')
    }
    return response.json()
  },

  // Add a new worker
  async create(worker: Worker): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      throw new Error('Failed to add worker')
    }

    return response.json()
  },

  // Update an existing worker
  async update(worker: Worker): Promise<Worker> {
    const response = await fetch(`${API_URL}/workers/${worker.id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(worker)
    })

    if (!response.ok) {
      throw new Error('Failed to update worker')
    }

    return response.json()
  },

  // Delete a worker
  async delete(id: string): Promise<void> {
    const response = await fetch(`${API_URL}/workers/${id}`, {
      method: 'DELETE'
    })

    if (!response.ok) {
      throw new Error('Failed to delete worker')
    }
  },

  // Delete multiple workers
  async deleteMany(ids: string[]): Promise<void> {
    // Create a promise for each delete operation
    const deletePromises = ids.map(id =>
      fetch(`${API_URL}/workers/${id}`, {
        method: 'DELETE'
      })
    )

    // Wait for all delete operations to complete
    const results = await Promise.allSettled(deletePromises)

    // Check if any operations failed
    const failedCount = results.filter(result => result.status === 'rejected').length

    if (failedCount > 0) {
      throw new Error(`Failed to delete ${failedCount} workers`)
    }
  }
}
