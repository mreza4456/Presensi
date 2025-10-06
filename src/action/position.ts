
"use server";
import {supabase} from "@/config/supabase-config";
import { IPositions } from "@/interface";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export const getAllPositions = async () => {
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
  const { data, error } = await supabase
    .from("positions")
    .select("*")
    .eq("organization_id", member.organization_id)
    .order("created_at", { ascending: true });

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IPositions[] };
};


export async function createPositions(payload: Partial<IPositions>) {
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
    .from("positions")
    .insert({
      ...payload,
      organization_id: orgId,
    })
    .select()
    .single();

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IPositions[] };
}


export async function updatePositions(id: string, payload: Partial<IPositions>) {
    const { data, error } = await supabase
        .from("positions")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IPositions[] };
}


export const deletePositions = async ( PositionsId: string | number) => {
     const id = String(PositionsId) // konversi ke string
    const { data, error } = await supabase
        .from("positions").delete().eq("id", id)
        .select()
        .single();

    if (error) {
        return { success: false, message: error.message, data: null };
    }
    return { success: true, message: "Deleted successfully", data: data as IPositions };
};

export const getAllOfPositions = async () => {
  const { data, error } = await supabase.from("positions").select("*");

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IPositions[] };
};

export const getPositionMembersByOrganization = async (organizationId: string) => {
  const { data, error } = await supabase
    .from("positions")
    .select(
      `
      id,
      title,
      organization_members:organization_members!position_id (id)
      `
    )
    .eq("organization_id", organizationId);

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  const result = (data || []).map((dept) => ({
    position: dept.title,
    members: dept.organization_members ? dept.organization_members.length : 0,
  }));

  return { success: true, data: result };
};
