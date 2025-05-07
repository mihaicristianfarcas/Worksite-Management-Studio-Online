import * as React from 'react'
import { Worker } from '@/services/types'
import { useWorkersStore } from '@/store/workers-store'

// Chart data types
export interface WorkerChartData {
  name: string
  age: number
  salary: number
  fill: string
}

export interface WorkerChartStats {
  averageAge: number
  averageSalary: number
  totalSalary: number
  oldestWorker: { name: string; age: number }
  youngestWorker: { name: string; age: number }
  highestPaidWorker: { name: string; salary: number }
  lowestPaidWorker: { name: string; salary: number }
}

export interface ChartConfig {
  [key: string]: {
    label: string
    color?: string
  }
}

export interface UseWorkersChartsReturn {
  // Data
  workers: Worker[]
  isLoading: boolean
  chartData: WorkerChartData[]
  chartConfig: ChartConfig
  sortedChartData: WorkerChartData[]

  // Stats
  stats: WorkerChartStats

  // Helpers
  getColorByIndex: (index: number) => string
  refreshChartData: () => Promise<void>
}

export function useWorkersCharts(): UseWorkersChartsReturn {
  // Get data and methods from store
  const { workers, loadingState, fetchWorkers } = useWorkersStore()

  // Define a function to get color from index
  const getColorByIndex = React.useCallback((index: number): string => {
    // Use modulo to cycle through colors if there are more workers than colors
    const colorIndex = (index % 20) + 1
    return `var(--chart-${colorIndex})`
  }, [])

  // Fetch workers data when the hook is initialized
  React.useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Transform worker data for charts
  const chartData = React.useMemo((): WorkerChartData[] => {
    if (!workers || workers.length === 0) return []

    return workers.map((worker, index) => {
      return {
        name: worker.name,
        age: worker.age,
        salary: worker.salary,
        fill: getColorByIndex(index)
      }
    })
  }, [workers, getColorByIndex])

  // Sort data by age for better visualization
  const sortedChartData = React.useMemo(() => {
    return [...chartData].sort((a, b) => a.age - b.age)
  }, [chartData])

  // Create chart config from worker data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      age: {
        label: 'Age'
      },
      salary: {
        label: 'Salary'
      }
    }

    if (!workers || workers.length === 0) return config

    workers.forEach((worker, index) => {
      config[worker.name] = {
        label: worker.name,
        color: `hsl(var(--chart-${getColorByIndex(index)}))`
      }
    })

    return config
  }, [workers, getColorByIndex])

  // Calculate stats
  const stats = React.useMemo(() => {
    if (!workers || workers.length === 0) {
      return {
        averageAge: 0,
        averageSalary: 0,
        totalSalary: 0,
        oldestWorker: { name: 'N/A', age: 0 },
        youngestWorker: { name: 'N/A', age: 0 },
        highestPaidWorker: { name: 'N/A', salary: 0 },
        lowestPaidWorker: { name: 'N/A', salary: 0 }
      }
    }

    const totalSalary = workers.reduce((acc, curr) => acc + curr.salary, 0)

    return {
      averageAge: Math.round(workers.reduce((acc, curr) => acc + curr.age, 0) / workers.length),
      averageSalary: totalSalary / workers.length,
      totalSalary,
      oldestWorker: workers.reduce((acc, curr) => (acc.age > curr.age ? acc : curr)),
      youngestWorker: workers.reduce((acc, curr) => (acc.age < curr.age ? acc : curr)),
      highestPaidWorker: workers.reduce((acc, curr) => (acc.salary > curr.salary ? acc : curr)),
      lowestPaidWorker: workers.reduce((acc, curr) => (acc.salary < curr.salary ? acc : curr))
    }
  }, [workers])

  // Function to refresh chart data
  const refreshChartData = React.useCallback(async () => {
    await fetchWorkers()
  }, [fetchWorkers])

  return {
    workers,
    isLoading: loadingState === 'loading',
    chartData,
    chartConfig,
    sortedChartData,
    stats,
    getColorByIndex,
    refreshChartData
  }
}
