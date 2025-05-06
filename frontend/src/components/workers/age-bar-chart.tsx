import { Bar, BarChart, XAxis, YAxis, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { PersonStanding, RefreshCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useWorkersCharts } from '@/hooks/use-workers-charts'

export function WorkersAgeBarChart() {
  // Get data from custom hook
  const { sortedChartData, chartConfig, isLoading, stats, refreshChartData } = useWorkersCharts()
  const { averageAge, oldestWorker, youngestWorker } = stats

  // Display loading state or empty state if no data
  if (sortedChartData.length === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-2 text-center'>
          <CardTitle>Workers Age Distribution</CardTitle>
          <CardDescription>Construction Team Overview</CardDescription>
        </CardHeader>
        <CardContent className='flex flex-1 items-center justify-center'>
          <p className='text-muted-foreground'>
            {isLoading ? 'Loading worker data...' : 'No worker data available'}
          </p>
        </CardContent>
        <CardFooter className='justify-center'>
          <Button
            variant='outline'
            size='sm'
            onClick={() => refreshChartData()}
            disabled={isLoading}
          >
            <RefreshCcw className='mr-2 h-4 w-4' />
            Refresh Data
          </Button>
        </CardFooter>
      </Card>
    )
  }

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='flex flex-row items-center justify-between pb-2'>
        <div className='text-center'>
          <CardTitle>Workers Age Distribution</CardTitle>
          <CardDescription>Construction Team Overview</CardDescription>
        </div>
        <Button variant='ghost' size='sm' onClick={() => refreshChartData()} disabled={isLoading}>
          <RefreshCcw className='h-4 w-4' />
        </Button>
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
