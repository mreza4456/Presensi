
"use server";
import {supabase} from "@/config/supabase-config";
import { IDepartments } from "@/interface";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { count } from "console";
import { cookies } from "next/headers";

export const getAllOfDepartments = async () => {
  const { data, error } = await supabase.from("departments").select("*");

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IDepartments[] };
};
export const getAllDepartments = async () => {
  const supabase = createServerComponentClient({ cookies });

  // 1. Ambil user dari cookies
  const { data: { user }, error: userError } = await supabase.auth.getUser();

  if (userError || !user) {
    return { success: false, message: "User not logged in", data: [] };
  }

  // 2. Cari organization_id user
  const { data: member } = await supabase
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (!member) {
    return { success: true, message: "User not registered in any organization", data: [] };
  }

  // 3. Ambil semua member sesuai org
  const { data, error , count } = await supabase
    .from("departments")
    .select("*",{ count: "exact" })
    .eq("organization_id", member.organization_id)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, message: error.message, data: [] , count: 0 };
  }

  return { success: true, data: data as IDepartments[] ,count };
};

export async function createDepartments(payload: Partial<IDepartments>) {
  const supabaseServer = createServerComponentClient({ cookies });

  // 1. Ambil user login
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "User not logged in", data: [] };
  }

  // 2. Cari organization_id dari organization_members
  const { data: member, error: memberError } = await supabaseServer
    .from("organization_members")
    .select("organization_id")
    .eq("user_id", user.id)
    .maybeSingle();

  if (memberError) {
    return { success: false, message: memberError.message, data: [] };
  }

  if (!member) {
    return { success: false, message: "User not registered in any organization", data: [] };
  }

  // 3. Insert department dengan organization_id yang sesuai
  const { data, error } = await supabase
    .from("departments")
    .insert({
      ...payload,
      organization_id: member.organization_id, // 👈 otomatis dari user
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IDepartments[] };
}


export async function updateDepartments(id: string, payload: Partial<IDepartments>) {
    const { data, error } = await supabase
        .from("departments")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IDepartments[] };
}


export const deleteDepartments = async ( departmentsId: string | number) => {
     const id = String(departmentsId) // konversi ke string
    const { data, error } = await supabase
        .from("departments").delete().eq("id", id)
        .select()
        .single();

    if (error) {
        return { success: false, message: error.message, data: null };
    }
    return { success: true, message: "Deleted successfully", data: data as IDepartments };
};
