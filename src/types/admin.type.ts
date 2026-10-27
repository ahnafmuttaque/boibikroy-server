type Role = "moderator" | "admin";
type Status = "active" | "suspend";

export type Admin = {
  id: number;
  email: string;
  password_hash: string;
  contact_no: string;
  role: Role;
  status: Status;
  suspended_by?: number;
  suspended_at?: string;
  created_at: string;
};
