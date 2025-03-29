import * as React from 'react'
import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent
} from '@/components/ui/chart'
import { PersonStanding } from 'lucide-react'
import { useWorkersStore } from '@/store/workers-store'

export function WorkersAgeBarChart() {
  // Get data and methods from store
  const { workers, fetchWorkers } = useWorkersStore()

  // Fetch workers data when the component mounts
  React.useEffect(() => {
    fetchWorkers()
  }, [fetchWorkers])

  // Transform worker data for the bar chart
  const chartData = React.useMemo(() => {
    if (!workers || workers.length === 0) return []

    return workers.map((worker, index) => {
      // Use modulo to cycle through colors if there are more workers than colors
      const colorIndex = (index % 20) + 1
      return {
        name: worker.name,
        age: worker.age,
        fill: `var(--chart-${colorIndex})`
      }
    })
  }, [workers])

  // Sort data by age for better visualization
  const sortedChartData = React.useMemo(() => {
    return [...chartData].sort((a, b) => a.age - b.age)
  }, [chartData])

  // Create chart config from worker data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      age: {
        label: 'Age'
      }
    }

    if (!workers || workers.length === 0) return config

    workers.forEach((worker, index) => {
      const colorIndex = (index % 20) + 1
      config[worker.name] = {
        label: worker.name,
        color: `hsl(var(--chart-${colorIndex}))`
      }
    })

    return config
  }, [workers])

  // Calculate average age
  const averageAge = React.useMemo(() => {
    if (!workers || workers.length === 0) return 0
    return Math.round(workers.reduce((acc, curr) => acc + curr.age, 0) / workers.length)
  }, [workers])

  // Get oldest worker
  const oldestWorker = React.useMemo(() => {
    if (!workers || workers.length === 0) return { name: 'N/A', age: 0 }
    return workers.reduce((acc, curr) => (acc.age > curr.age ? acc : curr))
  }, [workers])

  // Get youngest worker
  const youngestWorker = React.useMemo(() => {
    if (!workers || workers.length === 0) return { name: 'N/A', age: 0 }
    return workers.reduce((acc, curr) => (acc.age < curr.age ? acc : curr))
  }, [workers])

  // Display loading state or empty state if no data
  if (!workers || workers.length === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-2 text-center'>
          <CardTitle>Workers Age Distribution</CardTitle>
          <CardDescription>Construction Team Overview</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>
            {!workers ? 'Loading worker data...' : 'No worker data available'}
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-2 text-center'>
        <CardTitle>Workers Age Distribution</CardTitle>
        <CardDescription>Construction Team Overview</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 px-2 pb-0'>
        <ChartContainer config={chartConfig} className='h-[250px] w-full'>
          <ResponsiveContainer width='100%' height='100%'>
            <BarChart accessibilityLayer data={sortedChartData} layout='vertical'>
              <YAxis
                dataKey='name'
                type='category'
                tickLine={false}
                tickMargin={10}
                axisLine={false}
                width={70}
                fontSize={12}
                tickFormatter={value => {
                  // Truncate long names (shorter for mobile)
                  const maxLength = window.innerWidth < 640 ? 5 : 8
                  const label =
                    value.length > maxLength ? `${value.substring(0, maxLength)}...` : value
                  return label
                }}
              />
              <XAxis
                dataKey='age'
                type='number'
                axisLine={true}
                tickLine={true}
                domain={[0, 'dataMax + 5']}
              />
              <ChartTooltip
                cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                content={<ChartTooltipContent />}
              />
              <Bar dataKey='age' radius={[0, 4, 4, 0]} barSize={16} />
            </BarChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className='mt-auto flex-col gap-2 p-4 text-center text-sm'>
        <div className='flex items-center justify-center gap-2 font-medium leading-none'>
          <span>Average age: {averageAge} years</span>
          <PersonStanding className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground flex w-full flex-col justify-center gap-2 sm:flex-row sm:gap-8'>
          <span>
            Youngest: {youngestWorker.name}, {youngestWorker.age} y.o.
          </span>
          <span>
            Oldest: {oldestWorker.name}, {oldestWorker.age} y.o.
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
