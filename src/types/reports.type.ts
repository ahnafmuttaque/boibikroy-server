export const REPORT_TYPES = ["book", "student"] as const;
export type ReportType = (typeof REPORT_TYPES)[number];

export const REPORT_STATUSES = ["pending", "reviewed", "action_taken"] as const;

export type ReportStatus = (typeof REPORT_STATUSES)[number];

export type Report = {
  id: number;
  type: ReportType;
  book_id: number | null;
  student_id: number | null;
  reported_by: number;
  reason: string;
  status: ReportStatus;
  reviewed_by: number | null;
  reviewed_at: string | null;
  created_at: string;
};

export type ReportWithDetails = Report & {
  reporter_name?: string;
  reporter_email?: string;
  reported_student_name?: string;
  reported_student_email?: string;
  reported_book_title?: string;
  reviewer_name?: string;
};
