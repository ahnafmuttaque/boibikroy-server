import type { Feedback } from "@typedefs/feedbacks.type.js";
import type { PostFeedback } from "@validations/feedbacks.validation.js";

const feedbacks: Feedback[] = [];

export const addFeedback = async (feedbackBody: PostFeedback) => {
  const feedback: Feedback = {
    ...feedbackBody,
    id: feedbacks.length + 1,
    created_at: new Date().toISOString(),
    status: "pending",
  };

  feedbacks.push(feedback);
  return feedback;
};
