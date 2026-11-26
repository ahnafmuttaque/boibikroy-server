import db from "@config/db.config.js";
import type {
  Feedback,
  FeedbackWithReviewer,
} from "@typedefs/feedbacks.type.js";
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
    fields.push(`f.status = $${values.length}`);
  }
  if (subject) {
    values.push(`%${subject}%`);
    fields.push(`f.subject ILIKE $${values.length}`);
  }

  const pageSize = limit ?? 10;
  const pageNo = Math.max(1, page ?? 1);
  const offset = pageSize * (pageNo - 1);
  const whereClause = values.length > 0 ? `WHERE ${fields.join(" AND ")}` : "";

  const query = `
    SELECT
      f.*, a.full_name AS reviewer_name,
      COUNT(*) OVER() AS total_count
    FROM feedbacks AS f
      LEFT JOIN admins AS a ON f.reviewed_by = a.id
      ${whereClause}
      ORDER BY f.created_at DESC
      LIMIT ${pageSize} OFFSET ${offset};
  `;

  type FeedbackQuery = FeedbackWithReviewer & { total_count: number };
  const result = await db.query<FeedbackQuery>(query, values);
  const total =
    result.rows.length > 0 ? Number(result.rows[0]?.total_count) : 0;
  const totalPages = Math.ceil(total / pageSize);
  const feedbacks = result.rows.map(({ total_count, ...feedback }) => feedback);
  return {
    feedbacks,
    pagination: {
      limit: pageSize,
      page: pageNo,
      total,
      totalPages,
    },
  };
}

export async function getDBFeedbackById(feedbackId: number) {
  const query = `
    SELECT
      f.id, f.subject, f.full_name, f.contact_no, f.email, f.description, f.status,
      f.reviewed_by, a.full_name AS reviewer_name, f.reviewed_at, f.created_at
    FROM feedbacks AS f
      LEFT JOIN admins AS a ON f.reviewed_by = a.id
      WHERE f.id = $1;
  `;
  return db.query<FeedbackWithReviewer>(query, [feedbackId]);
}

export async function updateDBFeedbackStatus(
  feedbackId: number,
  adminId: number,
  statusBody: UpdateFeedbackStatus,
) {
  const { status } = statusBody;
  // only pending feedbacks are updated, so two admins can't review the same one
  const query = `
    UPDATE feedbacks
      SET status = $1, reviewed_by = $2, reviewed_at = CURRENT_TIMESTAMP
    WHERE
      id = $3 AND status = 'pending'
    RETURNING *;
  `;

  return db.query<Feedback>(query, [status, adminId, feedbackId]);
}
