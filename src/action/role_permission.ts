
"use server";
import {supabase} from "@/config/supabase-config";
import {IRolePermission } from "@/interface";

export const getAllRolePermission = async () => {
    const { data, error } = await supabase.from("role_permissions")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IRolePermission[] };
};
export async function createRolePermission(data: { role_id: number; permission_id: number }[]) {
  try {
    if (!data.length) {
      // kalau tidak ada permission → hapus semua untuk role_id
      const roleId = data[0]?.role_id
      if (roleId) {
        await supabase.from("role_permissions").delete().eq("role_id", roleId)
      }
      return { success: true, message: "All permissions removed" }
    }

    const roleId = data[0].role_id

    // 1️⃣ hapus semua lama
    const { error: delErr } = await supabase
      .from("role_permissions")
      .delete()
      .eq("role_id", roleId)

    if (delErr) throw new Error(delErr.message)

    // 2️⃣ insert baru
    const { error: insErr } = await supabase.from("role_permissions").insert(data)

    if (insErr) throw new Error(insErr.message)

    return { success: true, message: "Permissions updated" }
  } catch (err: any) {
    return { success: false, message: err.message }
  }
}


export const deleteRolePermission = async ( RoleId: string | number) => {
     const id = String(RoleId) // konversi ke string
    const { data, error } = await supabase
        .from("role_permissions").delete().eq("id", id)
        .select()
        .single();

    if (error) {
        return { success: false, message: error.message, data: null };
    }
    return { success: true, message: "Deleted successfully", data: data as IRolePermission };
};
export async function getRolePermissions(roleId: number) {
  const { data, error } = await supabase
    .from("role_permissions")
    .select("permission_id")
    .eq("role_id", roleId)

  if (error) {
    return { success: false, message: error.message, data: [] }
  }

  return { success: true, data: data ?? [] }
}
