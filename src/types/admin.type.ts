type Role = "moderator" | "admin";
type Status = "active" | "suspended" | "inactive";

export type Admin = {
  id: number;
  full_name: string;
  email: string;
  password_hash: string;
  contact_no: string;
  role: Role;
  status: Status;
  suspended_by?: number;
  suspended_at?: string;
  created_at: string;
  updated_at: string;
};
