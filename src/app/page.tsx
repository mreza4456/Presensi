"use client"
import { getUserOrganizationId } from "@/action/members";
import { ContentLayout } from "@/components/admin-panel/content-layout";
import { DepartmentChart } from "@/components/bar-chart";
import { ChartLineDots } from "@/components/line-chart";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, CartesianGrid, PieChart, Pie, Cell } from "recharts";

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
import { Building, ShieldCheck, UserRoundCheck, Users } from "lucide-react";
import { getAllDepartments } from "@/action/departement";
import { PositionChart } from "@/components/pie-chart";

interface OrgData {
  id: string
  name: string
  member_count: number
}

const chartConfig = {
  members: {
    label: "Members",
    color: "var(--chart-1)",
  },
} satisfies ChartConfig

export default function Home() {
  const [orgId, setOrgId] = useState<string | null>(null)
  const [orgStats, setOrgStats] = useState<OrgData[]>([])
  const [userCount, setUserCount] = useState<number>(0)
  const [roleCount, setRoleCount] = useState<number>(0)
  const [departmentCount, setDepartmentCount] = useState<number>(0)
  const [pieData, setPieData] = useState<any[]>([])

  // tambahan
  const [orgMembersCount, setOrgMembersCount] = useState<number>(0)
  const [orgRolesCount, setOrgRolesCount] = useState<number>(0)
  const [orgPositionsCount, setOrgPositionsCount] = useState<number>(0)

  useEffect(() => {
    async function fetchOrgId() {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const res = await getUserOrganizationId(user.id)
        setOrgId(res.organizationId)

        // kalau tidak ada org_id, ambil statistik global
        if (!res.organizationId) {
          const { data: orgs } = await supabase
            .from("organizations")
            .select(`
              id,
              name,
              organization_members(count)
            `)

          if (orgs) {
            const mapped: OrgData[] = orgs.map((org: any) => ({
              id: org.id,
              name: org.name,
              member_count: org.organization_members[0]?.count ?? 0,
            }))
            setOrgStats(mapped)
          }
          const { data: departments, count: departmentCount } = await getAllDepartments()

          // total users
          const { count: totalUsers } = await supabase
            .from("user_profiles")
            .select("*", { count: "exact", head: true })
          setUserCount(totalUsers || 0)

          // total roles
          const { count: totalRoles } = await supabase
            .from("system_roles")
            .select("*", { count: "exact", head: true })
          setRoleCount(totalRoles || 0)

          // user registered in org_members
          const { count: memberUsers } = await supabase
            .from("organization_members")
            .select("*", { count: "exact", head: true })

          const registered = memberUsers || 0
          const notRegistered = (totalUsers || 0) - registered

          setPieData([
            { name: "Registered", value: registered },
            { name: "Not Registered", value: notRegistered },
          ])
        } else {
          // kalau user punya org_id → ambil statistik spesifik organization
          const { count: members } = await supabase
            .from("organization_members")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", res.organizationId)
          setOrgMembersCount(members || 0)

          const { count: roles } = await supabase
            .from("system_roles")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", res.organizationId)
          setOrgRolesCount(roles || 0)

          const { count: positions } = await supabase
            .from("positions")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", res.organizationId)
          setOrgPositionsCount(positions || 0)

          const { count: departments } = await supabase
            .from("departments")
            .select("*", { count: "exact", head: true })
            .eq("organization_id", res.organizationId)
          setDepartmentCount(departments || 0)
        }
      }
    }
    fetchOrgId()
  }, [])

  // CASE: user belum punya organization
  if (orgId === null && orgStats.length > 0) {
    return (
      <ContentLayout title="Dashboard">
        <div className="mt-10">
          <div className="w-full max-w-6xl mx-auto">
            <div className="flex flex-1 flex-col gap-4 py-6 pt-0">
              <div className="grid auto-rows-min gap-4 md:grid-cols-3">
                {/* Organizations */}
                <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-purple-100 to-white">
                  <div className="items-center space-y-4">
                    <div className="flex items-center gap-2 ">
                      <div className="p-3 rounded-full bg-purple-100 text-purple-600">
                        <Building className="h-8 w-8" />
                      </div>
                      <h1 className="font-semibold">Organizations:</h1>
                    </div>
                    <div className="text-center mb-5">
                      <h1 className="text-4xl font-bold text-gray-800">{orgStats.length}</h1>
                      <p className="text-sm text-muted-foreground">Total All Organizations</p>
                    </div>
                  </div>
                </Card>

                {/* Users */}
                <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-cyan-100 to-white">
                  <div className="items-center space-y-4">
                    <div className="flex items-center gap-2 ">
                      <div className="p-3 rounded-full bg-cyan-100 text-cyan-600">
                        <Users className="h-8 w-8" />
                      </div>
                      <h1 className="font-semibold">Users:</h1>
                    </div>
                    <div className="text-center mb-5">
                      <h1 className="text-4xl font-bold text-gray-800">{userCount}</h1>
                      <p className="text-sm text-muted-foreground">Total All Users</p>
                    </div>
                  </div>
                </Card>

                {/* Roles */}
                <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-pink-100 to-white">
                  <div className="items-center space-y-4">
                    <div className="flex items-center gap-2 ">
                      <div className="p-3 rounded-full bg-pink-100 text-pink-600">
                        <ShieldCheck className="h-8 w-8" />
                      </div>
                      <h1 className="font-semibold">Roles:</h1>
                    </div>
                    <div className="text-center mb-5">
                      <h1 className="text-4xl font-bold text-gray-800">{roleCount}</h1>
                      <p className="text-sm text-muted-foreground">Total All Roles</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>

            {/* Bar Chart Organization Members */}
            <div className="grid grid-cols-2 gap-5">
              <Card>
                <CardHeader>
                  <CardTitle>Organizations</CardTitle>
                  <CardDescription>Total Members Per Organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig}>
                    <BarChart data={orgStats}>
                      <CartesianGrid vertical={false} />
                      <XAxis dataKey="name" tickLine={false} tickMargin={10} axisLine={false} />
                      <ChartTooltip cursor={false} content={<ChartTooltipContent hideLabel />} />
                      <Bar dataKey="member_count" fill="var(--color-members)" radius={8} />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="text-muted-foreground leading-none">
                    Showing Data Distribution Members Per Organizations
                  </div>
                </CardFooter>
              </Card>

              {/* Pie Chart Registered vs Not Registered */}
              <Card>
                <CardHeader>
                  <CardTitle>User Registration</CardTitle>
                  <CardDescription>Users registered in Organizations</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={pieData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {pieData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={index === 0 ? "#6366F1" : "#E5E7EB"}
                          />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
                <CardFooter className="flex-col items-start gap-2 text-sm">
                  <div className="text-muted-foreground leading-none">
                    Showing Registered vs Not Registered Users
                  </div>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </ContentLayout>
    )
  }

  // CASE: user punya organization
 return (
    <ContentLayout title="Dashboard">
      <div className="mt-10">
        <div className="w-full max-w-6xl mx-auto">
          <div className="flex flex-1 flex-col gap-4 py-6 pt-0">
            <div className="grid auto-rows-min gap-4 md:grid-cols-3">
              {/* Members */}
              <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-purple-100 to-white">
                <div className="items-center space-y-4">
                  <div className="flex items-center gap-2 ">
                    <div className="p-3 rounded-full bg-purple-200 text-purple-600">
                      <UserRoundCheck className="h-8 w-8" />
                    </div>
                    <h1 className="font-semibold">Members:</h1>
                  </div>
                  <div className="text-center mb-5">
                    <h1 className="text-4xl font-bold text-gray-800">{orgMembersCount}</h1>
                    <p className="text-sm text-muted-foreground">Total Members in Org</p>
                  </div>
                </div>
              </Card>

              {/* Departments */}
              <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-cyan-100 to-white">
                <div className="items-center space-y-4">
                  <div className="flex items-center gap-2 ">
                    <div className="p-3 rounded-full bg-cyan-200 text-cyan-600">
                      <Building className="h-8 w-8" />
                    </div>
                    <h1 className="font-semibold">Departments:</h1>
                  </div>
                  <div className="text-center mb-5">
                    <h1 className="text-4xl font-bold text-gray-800">{departmentCount}</h1>
                    <p className="text-sm text-muted-foreground">Total Departments</p>
                  </div>
                </div>
              </Card>

          

              {/* Positions */}
              <Card className="p-6 rounded-xl shadow-md border bg-gradient-to-br from-green-100 to-white">
                <div className="items-center space-y-4">
                  <div className="flex items-center gap-2 ">
                    <div className="p-3 rounded-full bg-green-200 text-green-600">
                      <Users className="h-8 w-8" />
                    </div>
                    <h1 className="font-semibold">Positions:</h1>
                  </div>
                  <div className="text-center mb-5">
                    <h1 className="text-4xl font-bold text-gray-800">{orgPositionsCount}</h1>
                    <p className="text-sm text-muted-foreground">Total Positions</p>
                  </div>
                </div>
              </Card>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <DepartmentChart organizationId={orgId!} />
          <PositionChart organizationId={orgId!}/>
            <div className="col-span-2">
              <ChartLineDots organizationId={orgId!} />
            </div>
          </div>
        </div>
      </div>
    </ContentLayout>
  )
}

