
"use server";
import {supabase} from "@/config/supabase-config";
import {  IMachine } from "@/interface";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { count } from "console";
import { cookies } from "next/headers";

export const getAllOfMachines = async () => {
  const { data, error } = await supabase
    .from("machines")
    .select(`
      id,
      code,
      type,
    
      is_active,
      organization_id,
      organizations!machines_organization_id_fkey (
        id,
        name
      )
    `);

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data };
};

export const getAllMachines = async () => {
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
    .from("machines")
    .select("*",{ count: "exact" })
    .eq("organization_id", member.organization_id)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, message: error.message, data: [] , count: 0 };
  }

  return { success: true, data: data as IMachine[] ,count };
};

export async function createMachines(payload: Partial<IMachine>) {
  const supabaseServer = createServerComponentClient({ cookies });

  // 1. Ambil user login
  const { data: { user }, error: userError } = await supabaseServer.auth.getUser();
  if (userError || !user) {
    return { success: false, message: "User not logged in", data: [] };
  }

  let orgId = payload.organization_id;

  // 2. Kalau payload tidak ada orgId → fallback ke membership
  if (!orgId) {
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

    orgId = member.organization_id;
  }

  // 3. Insert machine dengan orgId hasil logic di atas
  const { data, error } = await supabaseServer
    .from("machines")
    .insert({
      ...payload,
      organization_id: orgId,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IMachine[] };
}



export async function updateMachines(id: string, payload: Partial<IMachine>) {
    const { data, error } = await supabase
        .from("machines")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IMachine[] };
}


export const deleteMachines = async ( MachinesId: string | number) => {
     const id = String(MachinesId) // konversi ke string
    const { data, error } = await supabase
        .from("machines").delete().eq("id", id)
        .select()
        .single();

    if (error) {
        return { success: false, message: error.message, data: null };
    }
    return { success: true, message: "Deleted successfully", data: data as IMachine };
};
