"use server"
import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { IUser, IUserRole } from "@/interface"

type LoginResult =
  | {
      success: false
      message: string
    }
  | {
      success: true
      user: { id: string; email: string }
      profile: { id: string; display_name: string; profile_photo_url?: string } | null
      roles: { id: string | undefined; name: string | undefined }[]
      permissions: { code: string | undefined; name: string | undefined }[]
    }

// ======================
// SIGN UP
// ======================
export async function signUp(formData: FormData) {
  const supabase = createServerActionClient({ cookies })

  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const firstName = formData.get("first_name") as string
  const lastName = formData.get("last_name") as string

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        first_name: firstName,
        last_name: lastName,
        display_name: `${firstName} ${lastName}`,
      },
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { success: true, user: data.user }
}
export async function login(formData: FormData): Promise<LoginResult> {
  const supabase = createServerActionClient({ cookies })

  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // 1. Login
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { success: false, message: error.message }
  }
  if (!data.user) {
    return {
      success: false,
      message:
        "Login gagal. Pastikan email sudah dikonfirmasi di Supabase Auth settings.",
    }
  }

  const user = data.user

  // 2. Ambil profile user
  const { data: profile, error: profileError } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  if (profileError) {
    return { success: false, message: profileError.message }
  }

  // 3. Ambil roles user
  const { data: rolesData, error: roleError } = await supabase
    .from("user_roles")
    .select("role:system_roles(id, name)")
    .eq("user_id", user.id)

  if (roleError) {
    return { success: false, message: roleError.message }
  }

  const roles =
    rolesData?.map((r : any) => ({
      id: r.role?.id,
      name: r.role?.name,
    })) ?? []

  const roleIds = roles.map((r) => r.id).filter(Boolean)

  // 4. Ambil permissions dari role_permissions
  let permissions: { code: string; name: string }[] = []

  if (roleIds.length > 0) {
    const { data: permData, error: permError } = await supabase
      .from("role_permissions")
      .select("permission:permissions(code, name)")
      .in("role_id", roleIds as string[])

    if (permError) {
      return { success: false, message: permError.message }
    }

    permissions =
      permData?.map((p:any) => ({
        code: p.permission?.code,
        name: p.permission?.name,
      })) ?? []
  }

  return {
    success: true,
    user: { id: user.id, email: user.email! },
    profile: profile
      ? {
          id: profile.id,
          display_name: profile.display_name,
          profile_photo_url: profile.profile_photo_url,
        }
      : null,
    roles,
    permissions,
  }
}


// ======================
// GET ALL USERS
// ======================
export const getAllUsers = async () => {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from("user_profiles")
    .select(`
      *,
      user_roles (
        role: system_roles (id, name)
      )
    `)
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  // Normalisasi roles
  const usersWithRoles = data.map((u: any) => {
    let roles: { id: string; name: string }[] = []

    if (Array.isArray(u.user_roles)) {
      // Kalau array → langsung map
      roles = u.user_roles.map((ur: any) => ({
        id: ur.role?.id,
        name: ur.role?.name,
      }))
    } else if (u.user_roles && typeof u.user_roles === "object") {
      // Kalau object tunggal → bungkus ke array
      roles = [
        {
          id: u.user_roles.role?.id,
          name: u.user_roles.role?.name,
        },
      ]
    }

    return {
      ...u,
      roles,
    }
  })

  return { success: true, data: usersWithRoles as IUser[] }
}


export const getAllUsersNotRegistered = async () => {

  const supabase = createServerActionClient({ cookies })

  // 1. Ambil semua user_id dari organization_members
  const { data: members, error: memberError } = await supabase
    .from("organization_members")
    .select("user_id")

  if (memberError) {
    return { success: false, message: memberError.message, data: [] }
  }

  const memberIds = members.map(m => m.user_id)

  // 2. Ambil user_profiles yang id TIDAK ADA di memberIds
  const { data, error } = await supabase
    .from("user_profiles")
    .select("*")
    .not("id", "in", `(${memberIds.join(",") || 0})`) // kalau kosong, kasih default 0
    .order("created_at", { ascending: false })

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data: data as IUser[] }
}



// ======================
// GET CURRENT USER PROFILE
// ======================
export async function getCurrentUserProfile() {
  const supabase = createServerActionClient({ cookies })

  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    return { error: "Not logged in", profile: null }
  }

  const { data: profile, error } = await supabase
    .from("user_profiles")
    .select("*")
    .eq("id", session.user.id)
    .single()

  if (error || !profile) {
    return { error: error?.message || "Profile not found", profile: null }
  }

  return { error: null, profile }
}

export async function logout() {
  const supabase = createServerActionClient({ cookies })
  const { error } = await supabase.auth.signOut()

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export const deleteUsers = async (id: string) => {

  const supabase = createServerActionClient({ cookies })
  const { data, error } = await supabase
    .from("user_profiles")
    .delete()
    .eq("id", id)
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, data: null };
  }
  return { success: true, message: "Users deleted successfully", data: data as IUser };
};
export async function updateUsers(id: string, values: any) {
  const supabase = createServerActionClient({ cookies });

  // langsung update profile tanpa role_id
  const { error } = await supabase
    .from("user_profiles")
    .update(values)
    .eq("id", id);

  if (error) {
    return { success: false, message: error.message };
  }

  return { success: true, message: "User updated successfully" };
}

export async function getUserRoles(userId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data: roles, error } = await supabase
    .from("user_roles")
    .select(`
      role:system_role(name, id)
    `)
    .eq("user_id", userId)

  if (error) return { success: false, message: error.message, data: [] }

  return { success: true, data: roles }
}

export async function getUserPermissions(userId: string) {
  const supabase = createServerActionClient({ cookies })

  // 1. Ambil roles user
  const { data: roles, error: roleError } = await supabase
    .from("user_roles")
    .select(`role_id`)
    .eq("user_id", userId)

  if (roleError) return { success: false, message: roleError.message, data: [] }
  if (!roles || roles.length === 0) return { success: true, data: [] }

  const roleIds = roles.map(r => r.role_id)

  // 2. Ambil permissions dari role_permission
  const { data: permissions, error: permError } = await supabase
    .from("role_permissions")
    .select(`
      permission:permission(name, code),
      role:system_role(name)
    `)
    .in("role_id", roleIds)

  if (permError) return { success: false, message: permError.message, data: [] }

  return { success: true, data: permissions }
}

export async function assignUserRole(userId: string, roleId: string) {
  const supabase = createServerActionClient({ cookies })

  const { data, error } = await supabase
    .from("user_roles")
    .upsert({ user_id: userId, role_id: roleId }, { onConflict: "user_id, role_id" })
    .select()
    .single()

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: "Role berhasil ditambahkan", data }
}

export async function removeUserRole(userId: string, roleId: string) {
  const supabase = createServerActionClient({ cookies })

  const { error } = await supabase
    .from("user_roles")
    .delete()
    .eq("user_id", userId)
    .eq("role_id", roleId)

  if (error) {
    return { success: false, message: error.message }
  }

  return { success: true, message: "Role berhasil dihapus" }
}

