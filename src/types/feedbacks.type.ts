export const FEEDBACK_STATUS = [
  "pending",
  "reviewed",
  "mark-as-improvement",
] as const;

export type FeedbackStatus = (typeof FEEDBACK_STATUS)[number];

export interface Feedback {
  id: number;
  subject: string;
  full_name: string;
  contact_no: string;
  email: string;
  description: string;
  status: FeedbackStatus;
  created_at: string;
}


