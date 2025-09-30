export interface IUser {
    id: string;
    employee_code: string;
    first_name: string;
    middle_name?: string;
    last_name: string;
    display_name: string;
    phone?: string;
    mobile?: string;
    date_of_birth?: string;
   gender: "male" | "female" | null;
    nationality?: string;
    national_id?: string;
    profile_photo_url?: string;
    emergency_contact?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;
      roles?: { id: string; name: string }[]
}
export interface IOrganization {
    id: string
    code?: string
    name: string
    legal_name?: string
    tax_id?: string
    industry?: string
    size_category?: string
    timezone?: string
    currency_code?: string
    country_code?: string
    address?: string
    city?: string
    state_province?: string
    postal_code?: string // ✅ ubah ke string
    phone?: string       // ✅ ubah ke string
    email?: string
    website?: string
    logo_url?: string | null
    is_active: boolean
    subscription_tier?: string // ✅ perbaikan typo
    subscription_expires_at?: string | null
    created_at: string
    updated_at?: string
}


export interface IDepartments {
    id: string;
    organization_id: string;
    parent_department_id?: string;
    code?: string;
    name: string;
    description?: string;
    head_member_id?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;

    organization?: IOrganization;

}
export interface IPositions {
    id: string;
    organization_id: string;
    code?: string;
    title: string;
    description?: string;
    level?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;

    organization?: IOrganization;

}

export interface IOrganization_member {
    id: string;
    organization_id: string;
    user_id: string;
    employee_id: string;
    department_id?: string;
    position_id?: string;
    direct_manager_id?: string;
    hire_date?: string;
    probation_end_date?: string;
    contract_type?: string;
    employment_status?: string;
    termination_date?: string;
    work_location?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;

    user?: IUser;
    departments?: IDepartments;
    positions?: IPositions;
    organization?: IOrganization;
    rfid_cards:IRfidCard;
}

export interface IAttendance {
    id: string;
    organization_member_id: string;
    attendance_date: string;
    schedule_shift_id?: string;
    sheduled_start: string;
    sheduled_end: string;
    actual_check_in?: string;
    actual_check_out?: string;
    checkin_device?: string;
    checkout_device?: string;
    checkin_method?: string;
    checkout_method?: string;
    checkin_location?: string;
    checkout_location?: string;
    check_in_photo_url?: string;
    check_out_photo_url?: string;
    work_duration_minutes?: number;
    break_duration_minutes?: number;
    overtime_minutes?: number;
    late_minutes?: number;
    early_leave_minutes?: number;
    status: "present" | "absent" | "late" | "excused";
    validated_status?: "approved" | "rejected" | "pending";
    validated_by?: string;
    validated_at?: string;
    validated_note?: string;
    application_id?: string;
    raw_data?: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;


    organization_member?: IOrganization_member;



}

export interface IWorkSchedule {
  id: string;
  organization_id: string;
  code?: string;
  name: string;
  description?: string;
  schedule_type: string;
  is_default: boolean;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
  work_schedule_details?: any[]
}


export interface IWorkScheduleDetail {
    id: string;
    work_schedule_id: number;
    day_of_week: number; 
    is_working_day:boolean;// 0=Sunday, 1=Monday, ..., 6=Saturday
    start_time?: string; // HH:MM:SS
    end_time?: string;   // HH:MM:SS
    break_start:string;
    break_end:string;
    break_duration_minutes?: number;
    flexible_hours: boolean;
    is_active: boolean;
    created_at: string;
    updated_at?: string;    

    work_schedule?: IWorkSchedule;

}

export interface IMemberSchedule{
    id: string;
    organization_member_id: string;
    work_schedule_id: string;
    shift_id:string;
    effective_date: string;
    is_active: boolean;
    created_at: string;
    updated_at?: string;

    organization_member?: IOrganization_member;
    work_schedule?: IWorkSchedule;
}

export interface IRole{
    id:string;
    code?:string;
    name:string;
    description:string;
}

export interface IPermission{
    id:string;
    code?:string;
    module:string;
    name:string;
    description:string;
}

export interface IRolePermission{
    id:string;
    role_id: number;
  permission_id: string;
    created_at:string;
    role?:IRole;
    permission:IPermission;
}

export interface IUserRole{
    user_id:string;
    role_id:string;

    user:IUser
    role:IRole;
}

export interface IRfidCard{
    id:string;
    organization_member_id:string;
    card_number:string;
    card_type:string;
    issue_date:string;
    organization_member:IOrganization_member;


}