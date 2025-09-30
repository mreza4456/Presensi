"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { TrendingUp } from "lucide-react"
import { CartesianGrid, Line, LineChart, XAxis } from "recharts"

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart"

export const description = "A line chart with attendance data"

const chartConfig = {
  attendance: {
    label: "Attendance",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export function ChartLineDots({ organizationId }: { organizationId: string }) {
  const [chartData, setChartData] = useState<any[]>([])

  useEffect(() => {
  async function fetchData() {
    if (!organizationId) {
      console.warn("organizationId is null, skip fetch")
      return
    }

    const supabase = createClientComponentClient()

    const { data, error } = await supabase
      .from("attendance_records")
      .select(`
        attendance_date,
        actual_check_in,
        organization_members (
          organization_id
        )
      `)
      .eq("organization_members.organization_id", organizationId)

    if (error) {
      console.error("Error fetching attendance:", error.message)
      return
    }

    if (!data) return

    // group per bulan
    const grouped: Record<string, number> = {}
    data.forEach((item) => {
      const date = new Date(item.attendance_date)
      const month = date.toLocaleString("default", { month: "long" }) // ex: January
      grouped[month] = (grouped[month] || 0) + 1
    })

    // convert ke format untuk chart
    const formatted = Object.entries(grouped).map(([month, count]) => ({
      month,
      attendance: count,
    }))

    setChartData(formatted)
  }

  fetchData()
}, [organizationId])


  return (
    <Card>
      <CardHeader>
        <CardTitle>Attendance Chart</CardTitle>
        <CardDescription>Monthly attendance records</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig}>
          <LineChart
            accessibilityLayer
            data={chartData}
            margin={{
              left: 12,
              right: 12,
            }}
          >
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              tickFormatter={(value) => value.slice(0, 3)}
            />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Line
              dataKey="attendance"
              type="natural"
              stroke="var(--color-attendance)"
              strokeWidth={2}
              dot={{
                fill: "var(--color-attendance)",
              }}
              activeDot={{
                r: 6,
              }}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">

      </CardFooter>
    </Card>
  )
}
