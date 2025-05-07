import * as React from 'react'
import { RefreshCcw } from 'lucide-react'
import { Cell, Pie, PieChart, ResponsiveContainer } from 'recharts'
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle
} from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { useWorkersCharts } from '@/hooks/use-workers-charts'

export function WorkersPositionChart() {
  // Get data from custom hook
  const { workers, isLoading, chartConfig, refreshChartData } = useWorkersCharts()

  // Transform data to count workers by position
  const positionData = React.useMemo(() => {
    if (!workers || workers.length === 0) return []

    // Count workers by position
    const positions = workers.reduce(
      (acc, worker) => {
        const position = worker.position
        if (!acc[position]) {
          acc[position] = 0
        }
        acc[position]++
        return acc
      },
      {} as Record<string, number>
    )

    // Transform to chart data
    return Object.entries(positions).map(([position, count], index) => {
      return {
        name: position,
        value: count,
        fill: `var(--chart-${(index % 20) + 1})`
      }
    })
  }, [workers])

  // Display loading state or empty state if no data
  if (positionData.length === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-2 text-center'>
          <CardTitle>Workers by Position</CardTitle>
          <CardDescription>Position Distribution</CardDescription>
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
          <CardTitle>Workers by Position</CardTitle>
          <CardDescription>Position Distribution</CardDescription>
        </div>
        <Button variant='ghost' size='sm' onClick={() => refreshChartData()} disabled={isLoading}>
          <RefreshCcw className='h-4 w-4' />
        </Button>
      </CardHeader>
      <CardContent className='flex-1 px-2 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px] max-w-[250px]'
        >
          <ResponsiveContainer width='100%' height='100%'>
            <PieChart>
              <ChartTooltip cursor={false} content={<ChartTooltipContent />} />
              <Pie
                data={positionData}
                dataKey='value'
                nameKey='name'
                cx='50%'
                cy='50%'
                outerRadius={80}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                labelLine={true}
              >
                {positionData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
        </ChartContainer>
      </CardContent>
      <CardFooter className='mt-auto flex-col gap-2 p-4 text-center text-sm'>
        <div className='font-semibold'>Total positions: {positionData.length}</div>
        <div className='text-muted-foreground grid grid-cols-2 gap-1 text-xs'>
          {positionData.map(position => (
            <span key={position.name}>
              {position.name}: {position.value} worker{position.value !== 1 ? 's' : ''}
            </span>
          ))}
        </div>
      </CardFooter>
    </Card>
  )
}
