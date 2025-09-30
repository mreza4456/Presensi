
"use server";
import {supabase} from "@/config/supabase-config";
import {IRole } from "@/interface";

export const getAllRole = async () => {
    const { data, error } = await supabase.from("system_roles")
        .select("*")
        .order("created_at", { ascending: false })

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IRole[] };
};

export async function createRole(payload: Partial<IRole>) {
    const { data, error } = await supabase
        .from("system_roles")
        .insert(payload)
        .select()
        .single()

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IRole[] };
}

export async function updateRole(id: string, payload: Partial<IRole>) {
    const { data, error } = await supabase
        .from("system_roles")
        .update({ ...payload, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single()

    if (error) {
        return { success: false, message: error.message, data: [] };
    }

    return { success: true, data: data as IRole[] };
}


export const deleteRole = async ( RoleId: string | number) => {
     const id = String(RoleId) // konversi ke string
    const { data, error } = await supabase
        .from("system_roles").delete().eq("id", id)
        .select()
        .single();

    if (error) {
        return { success: false, message: error.message, data: null };
    }
    return { success: true, message: "Deleted successfully", data: data as IRole };
};
