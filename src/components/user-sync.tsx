"use client"

import { useEffect } from "react"
import { supabase } from "@/config/supabase-config"
import { useAuthStore } from "@/store/user-store"

export default function ClientUserSync() {
  const setUser = useAuthStore((state) => state.setUser)
  const setPermissions = useAuthStore((state) => state.setPermissions)
 

  useEffect(() => {
    const syncUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        // 🔹 Ambil data profil
        const { data: profile, error: profileError } = await supabase
          .from("user_profiles")
          .select("name, profile_photo_url")
          .eq("id", user.id)
          .maybeSingle()

        if (profileError) console.warn("Profile fetch error:", profileError)

        // 🔹 Ambil permissions user dari tabel organization_members
        const { data: orgMember, error: orgError } = await supabase
          .from("organization_members")
          .select("permissions")
          .eq("user_id", user.id)
          .maybeSingle()

        if (orgError) console.warn("Organization member fetch error:", orgError)

        // 🔹 Simpan user dan permissions ke Zustand
        setUser({
          id: user.id,
          email: user.email,
          name: profile?.name || user.email,
          // ⚠️ Filter agar tidak menyimpan string kosong
          profile_photo_url:
            profile?.profile_photo_url && profile.profile_photo_url.trim() !== ""
              ? profile.profile_photo_url
              : null,
        })

        setPermissions(orgMember?.permissions || [])
      } else {
        setUser(null)
        setPermissions([])
      }
    }

    syncUser()

    // 🔹 Listener login/logout realtime
    const { data: subscription } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        if (!session?.user) {
          setUser(null)
          setPermissions([])
        } else {
          await syncUser()
        }
      }
    )

    return () => {
      subscription.subscription.unsubscribe()
    }
  }, [setUser, setPermissions, supabase])

  return null
}
