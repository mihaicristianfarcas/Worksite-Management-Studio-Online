'use client'
import { TrendingUp, RefreshCcw } from 'lucide-react'
import { Label, Pie, PieChart } from 'recharts'
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

export function WorkersSalaryPieChart() {
  // Get data from custom hook
  const { chartData, chartConfig, isLoading, stats, refreshChartData } = useWorkersCharts()
  const { totalSalary, averageSalary, highestPaidWorker, lowestPaidWorker } = stats

  // Display loading state or empty state if no data
  if (chartData.length === 0) {
    return (
      <Card className='flex h-full flex-col'>
        <CardHeader className='items-center pb-2 text-center'>
          <CardTitle>Workers Salary Distribution</CardTitle>
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
          <CardTitle>Workers Salary Distribution</CardTitle>
          <CardDescription>Construction Team Overview</CardDescription>
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
          <PieChart>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie data={chartData} dataKey='salary' nameKey='name' innerRadius={60} strokeWidth={5}>
              <Label
                content={({ viewBox }) => {
                  if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                    const fontSize = window.innerWidth < 640 ? 'text-xl' : 'text-3xl'
                    return (
                      <text
                        x={viewBox.cx}
                        y={viewBox.cy}
                        textAnchor='middle'
                        dominantBaseline='middle'
                      >
                        <tspan
                          x={viewBox.cx}
                          y={viewBox.cy}
                          className={`fill-foreground ${fontSize} font-bold`}
                        >
                          {totalSalary.toLocaleString()}
                        </tspan>
                        <tspan
                          x={viewBox.cx}
                          y={(viewBox.cy || 0) + (window.innerWidth < 640 ? 18 : 24)}
                          className='fill-muted-foreground text-xs'
                        >
                          Total Salary
                        </tspan>
                      </text>
                    )
                  }
                }}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className='mt-auto flex-col gap-2 p-4 text-center text-sm'>
        <div className='flex items-center justify-center gap-2 font-medium leading-none'>
          Average Salary: RON {averageSalary.toFixed(2)} <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground flex w-full flex-col justify-center gap-2 sm:flex-row sm:gap-8'>
          <span>
            Lowest: {lowestPaidWorker.name}, RON {lowestPaidWorker.salary.toLocaleString()}
          </span>
          <span>
            Highest: {highestPaidWorker.name}, RON {highestPaidWorker.salary.toLocaleString()}
          </span>
        </div>
      </CardFooter>
    </Card>
  )
}
