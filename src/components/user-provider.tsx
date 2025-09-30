"use client"

import { useEffect } from "react"
import { useAuthStore } from "@/store/user-store"

export function UserProvider({ user }: { user: any }) {
  const setUser = useAuthStore((state) => state.setUser)

  useEffect(() => {
    setUser(user)
  }, [user, setUser])

  return null
}
