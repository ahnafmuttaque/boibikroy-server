import type {PostFeedback} from "../validations/feedbacks.validation.js";

const feedbackStatus = ["reviewed", "pending", "mark-as-improvement"] as const;

export interface Feedback extends PostFeedback {
    id: number;
    created_at: string;
    status: typeof feedbackStatus[number];
}
