"use client"

import React, { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import z from "zod"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"

import { getAllPermission } from "@/action/permission"
import { getRolePermissions, createRolePermission } from "@/action/role_permission"
import TopBar from "@/components/top-bar"
import { ContentLayout } from "@/components/admin-panel/content-layout"

const schema = z.object({
  permission_ids: z.array(z.number()).optional(),
})

type FormValues = z.infer<typeof schema>

export default function RolePermissionPage() {
  const params = useParams()
  const roleId = Number(params.id)

  const [permissions, setPermissions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: { permission_ids: [] },
  })

  // Fetch data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [permRes, rolePermRes] = await Promise.all([
          getAllPermission(),
          getRolePermissions(roleId),
        ])

        if (!permRes.success) throw new Error(permRes.message)
        if (!rolePermRes.success) throw new Error(rolePermRes.message)

        setPermissions(permRes.data)

        const rolePermIds = rolePermRes.data.map((rp: any) => rp.permission_id)
        form.reset({ permission_ids: rolePermIds })
      } catch (err: any) {
        toast.error(err.message)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [roleId])

  const onSubmit = async (values: FormValues) => {
    try {
      if (!values.permission_ids) values.permission_ids = []

      // siapkan data untuk insert baru
      const insertData = values.permission_ids.map((pid) => ({
        role_id: roleId,
        permission_id: pid,
      }))

      // createRolePermission sudah handle "hapus lama → insert baru"
      const res = await createRolePermission(insertData)
      if (!res.success) throw new Error(res.message)

      toast.success("Permissions updated successfully")
    } catch (err: any) {
      toast.error(err.message)
    }
  }

  if (loading) return <div className="loader"></div>

  // 🔹 group berdasarkan module
  const groupedPermissions = permissions.reduce((acc: any, perm: any) => {
    const moduleName = perm.module || "Other"
    if (!acc[moduleName]) acc[moduleName] = []
    acc[moduleName].push(perm)
    return acc
  }, {})

  return (
    <ContentLayout title="Role Permission">

      <div className="max-w-6xl mx-auto mt-20">
       
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="permission_ids"
              render={({ field }) => (
                <FormItem>
                  {Object.keys(groupedPermissions).map((moduleName) => (
                    <div
                      key={moduleName}
                      className="mb-6 border rounded-md p-4 bg-gray-50"
                    >
                      <h2 className="font-semibold mb-2 text-gray-700">
                        {moduleName}
                      </h2>
                      <div className="space-y-2 grid grid-cols-4 mt-5">
                        {groupedPermissions[moduleName].map((perm: any) => (
                          <FormItem
                            key={perm.id}
                            className="flex items-center gap-2 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(perm.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    field.onChange([...(field.value || []), perm.id])
                                  } else {
                                    field.onChange(
                                      field.value?.filter((v) => v !== perm.id)
                                    )
                                  }
                                }}
                              />
                            </FormControl>
                            <FormLabel>{perm.name}</FormLabel>
                          </FormItem>
                        ))}
                      </div>
                    </div>
                  ))}
                </FormItem>
              )}
            />
            <Button type="submit" className="float-end">
              Save
            </Button>
          </form>
        </Form>
      </div>
    </ContentLayout>
  )
}
