import db from "@config/db.config.js";
import type { Feedback } from "@typedefs/feedbacks.type.js";
import type {
  CreateFeedback,
  GetFeedbacksQuery,
  UpdateFeedbackStatus,
} from "@validations/feedbacks.validation.js";

export async function createDBFeedback(feedbackBody: CreateFeedback) {
  const { fields, values, placeHolders } = Object.entries(feedbackBody).reduce<{
    values: Array<string>;
    fields: Array<string>;
    placeHolders: Array<string>;
  }>(
    (acc, [key, value]) => {
      acc.values.push(value);
      acc.fields.push(key);
      acc.placeHolders.push(`$${acc.values.length}`);
      return acc;
    },
    { values: [], fields: [], placeHolders: [] },
  );

  const query = `
    INSERT INTO feedbacks
        ( ${fields.join(", ")} )
    values
        ( ${placeHolders.join(", ")} )
    RETURNING *;
  `;
  return db.query<Feedback>(query, values);
}
export async function getDBFeedbacks(filters: GetFeedbacksQuery) {
  const fields: Array<any> = [];
  const values: Array<any> = [];
  const { limit, page, status, subject } = filters;

  if (status) {
    values.push(status.toLowerCase().trim());
    fields.push(`status = $${values.length}`);
  }
  if (subject) {
    values.push(`%${subject}%`);
    fields.push(`subject ILIKE $${values.length}`);
  }

  const pageSize = limit ?? 10;
  const pageNo = Math.max(1, page ?? 1);
  const offset = pageSize * (pageNo - 1);
  const whereClause = values.length > 0 ? `WHERE ${fields.join(" AND ")}` : "";

  const query = `
    SELECT * FROM feedbacks
      ${whereClause}
      ORDER BY created_at DESC
      LIMIT ${pageSize} OFFSET ${offset};
  `;

  return db.query(query, values);
}

export async function getDBFeedbackById(feedbackId: number) {
  const query = `
    SELECT
      id, subject, full_name, contact_no, email, description, status, created_at
    FROM feedbacks
      WHERE id = $1;
  `;
  return db.query<Feedback>(query, [feedbackId]);
}

export async function updateDBFeedbackStatus(
  feedbackId: number,
  statusBody: UpdateFeedbackStatus,
) {
  const { status } = statusBody;
  const query = `
    UPDATE feedbacks
      SET status = $1
    WHERE
      id = $2
    RETURNING *;
  `;

  return db.query<Feedback>(query, [status, feedbackId]);
}
