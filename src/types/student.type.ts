export type StudentStatus = "active" | "inactive" | "suspended";

export type Student = {
  id: number;
  full_name: string;
  contact_no: string;
  email: string;
  college_id: number;
  password_hash: string;
  role: "student";
  edu_level_id: number;
  status: StudentStatus;
  suspended_by?: number;
  suspend_reason?: string;
  suspended_at?: string;
  upazila_id: number;
  address?: string;
  created_at: string;
  updated_at: string;
};
