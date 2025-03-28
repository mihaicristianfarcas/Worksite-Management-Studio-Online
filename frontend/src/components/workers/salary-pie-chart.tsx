'use client'
import * as React from 'react'
import { TrendingUp } from 'lucide-react'
import { Label, Pie, PieChart } from 'recharts'
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
import { data } from '@/data/model'

export function WorkersSalaryPieChart() {
  // Transform worker data for the pie chart
  const chartData = React.useMemo(() => {
    return data.map((worker, index) => {
      // Create a color palette using CSS variables
      const colorIndex = index + 1
      return {
        name: worker.name,
        salary: worker.salary,
        fill: `var(--chart-${colorIndex})`
      }
    })
  }, [])

  // Create chart config from worker data
  const chartConfig = React.useMemo(() => {
    const config: ChartConfig = {
      salary: {
        label: 'Salary'
      }
    }

    data.forEach((worker, index) => {
      const colorIndex = index + 1
      config[worker.name] = {
        label: worker.name,
        color: `hsl(var(--chart-${colorIndex}))`
      }
    })

    return config
  }, [])

  // Calculate total salary
  const totalSalary = React.useMemo(() => {
    return data.reduce((acc, curr) => acc + curr.salary, 0)
  }, [])

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='items-center pb-2 text-center'>
        <CardTitle>Workers Salary Distribution</CardTitle>
        <CardDescription>Construction Team Overview</CardDescription>
      </CardHeader>
      <CardContent className='flex-1 px-2 pb-0'>
        <ChartContainer
          config={chartConfig}
          className='mx-auto aspect-square h-[250px] max-w-[250px]'
        >
          <PieChart margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
            <Pie
              data={chartData}
              dataKey='salary'
              nameKey='name'
              innerRadius={window.innerWidth < 640 ? 40 : 60}
              strokeWidth={5}
            >
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
          Average Salary: RON {(totalSalary / data.length).toFixed(2)}{' '}
          <TrendingUp className='h-4 w-4' />
        </div>
        <div className='text-muted-foreground leading-none'>
          Showing salary distribution across {data.length} construction workers
        </div>
      </CardFooter>
    </Card>
  )
}
