// utils/supabase/server.ts
import { cookies } from "next/headers"
import { createServerComponentClient, createServerActionClient } from "@supabase/auth-helpers-nextjs"

// untuk Server Component
export const createServerClient = () => createServerComponentClient({ cookies })

// untuk Server Action
export const createActionClient = () => createServerActionClient({ cookies })
