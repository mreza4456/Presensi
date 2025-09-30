// app/api/system_roles/route.ts
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"

export async function GET() {
  const supabase = createRouteHandlerClient({ cookies })
  const { data, error } = await supabase.from("system_roles").select("id, name")

  if (error) {
    return Response.json([], { status: 500 })
  }

  return Response.json(data)
}
