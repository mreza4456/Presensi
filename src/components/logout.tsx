"use client"

import { Button } from "@/components/ui/button"
import { logout } from "@/action/users"
import { useRouter } from "next/navigation"
import { LogOut } from "lucide-react"
import { useAuthStore } from "@/store/user-store"

export default function LogoutButton() {
  const router = useRouter()
  const setUser = useAuthStore((state) => state.setUser)

  const handleLogout = async () => {
    const result = await logout()
    if (result.success) {
      setUser(null) // 🧹 clear Zustand user
      router.replace("/auth/login") // pakai replace biar ga bisa back
    } else {
      alert(result.error)
    }
  }

  return (
    <Button
      variant="ghost"
      className="w-full justify-start"
      onClick={handleLogout}
    >
      <LogOut className="mr-2 " />
      Log out
    </Button>
  )
}
