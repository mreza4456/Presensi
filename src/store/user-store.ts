import { create } from "zustand"
import { persist } from "zustand/middleware"

interface User {
  id: string
  email: string
  name?: string
  profile_photo_url?: string
}

interface AuthState {
  user: User | null
  permissions: string[]
  setUser: (user: User | null) => void
  setPermissions: (permissions: string[]) => void
  reset: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      permissions: [],
      setUser: (user) => set({ user }),
      setPermissions: (permissions) => set({ permissions }),
      reset: () => set({ user: null, permissions: [] }),
    }),
    {
      name: "auth-storage", // key di localStorage
    }
  )
)
