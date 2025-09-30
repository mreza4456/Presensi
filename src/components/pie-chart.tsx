"use client"

import { useEffect, useState } from "react"
import { Pie, PieChart } from "recharts"

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

import { getPositionMembersByOrganization } from "@/action/position"

const chartConfig = {
  members: {
    label: "Members",
  },
} satisfies ChartConfig

export function PositionChart({ organizationId }: { organizationId: string }) {
  const [chartData, setChartData] = useState<
    { position: string; members: number; fill: string }[]
  >([])

  useEffect(() => {
    async function fetchData() {
      const res = await getPositionMembersByOrganization(organizationId)
      if (res.success) {
        // kasih warna biar tiap slice beda
        const colors = [
          "var(--chart-1)",
          "var(--chart-2)",
          "var(--chart-3)",
          "var(--chart-4)",
          "var(--chart-5)",
        ]

        const formatted = res.data.map((item, i) => ({
          position: item.position,
          members: item.members,
          fill: colors[i % colors.length],
        }))
console.log("res:", res)


        setChartData(formatted)
      }
      console.log("res:", res)

    }
    fetchData()
  }, [organizationId])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Member Distribution</CardTitle>
        <CardDescription>Per Position</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer
          config={chartConfig}
          className="mx-auto aspect-square max-h-[250px]"
        >
          <PieChart>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie data={chartData} dataKey="members" nameKey="position" />
          </PieChart>
        </ChartContainer>
      </CardContent>
      <CardFooter className="flex-col items-start gap-2 text-sm">
        <div className="text-muted-foreground leading-none">
          Showing Data Distribution Members Per Positions
        </div>
      </CardFooter>
    </Card>
  )
}
