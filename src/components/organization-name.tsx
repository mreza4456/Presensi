"use client"

import { useEffect, useState } from "react"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import { getUserOrganizationName } from "@/action/organization"

export function BrandName() {
  const [orgName, setOrgName] = useState("E-Attendance")

  useEffect(() => {
    async function fetchOrg() {
      const supabase = createClientComponentClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        const res = await getUserOrganizationName(user.id)
        setOrgName(res.name)
      }
    }
    fetchOrg()
  }, [])

  return <>{orgName}</>
}
