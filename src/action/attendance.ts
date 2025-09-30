
"use server";
import {supabase} from "@/config/supabase-config";
import { IAttendance } from "@/interface";

// // ➕ Add MemIOrganization_member
// export const addOrganization_member = async (Organization_member: Partial<IOrganization_member>) => {
//   const { data, error } = await supabase.from("Organization_members").insert([Organization_member]).select().single();

//   if (error) {
//     return { success: false, message: error.message, data: null };
//   }
//   return { success: true, message: "Show added successfully", data: data as IOrganization_member };
// };

export const getAllAttendance = async () => {
  const { data, error } = await supabase.from("attendance_records").select("*").order("created_at",{ascending:true});

  if (error) {
    return { success: false, message: error.message, data: [] };
  }

  return { success: true, data: data as IAttendance[] };
};

export async function updateAttendanceStatus(id: string, status: string) {

  try {
    const { error } = await supabase
      .from("attendance_records")
      .update({ status })
      .eq("id", id)

    if (error) throw error
    return { success: true }
  } catch (error: any) {
    return { success: false, message: error.message }
  }
}