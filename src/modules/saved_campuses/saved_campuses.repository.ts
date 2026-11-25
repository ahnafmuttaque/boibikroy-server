import db from "@config/db.config.js";
import type {
  SavedCampus,
  SavedCampusWithCollege,
} from "@typedefs/saved_campuses.type.js";
import type {
  CreateSavedCampus,
  UpdateSavedCampus,
} from "@validations/saved_campuses.validation.js";

export const getDBCampusWithSidAndClgId = async (
  studentId: number,
  collegeId: number,
) => {
  const query = `
  SELECT
    s.id, s.college_id, s.meeting_place, s.created_at, s.updated_at,
    c.name AS college_name, c.code AS college_code, c.address AS college_address
  FROM saved_campuses
    LEFT JOIN colleges ON s.college_id = c.id
    WHERE s.student_id = $1 AND s.college_id = $2;
  ;
  `;
  return db.query<Omit<SavedCampusWithCollege, "student_id">>(query, [
    studentId,
    collegeId,
  ]);
};

export const insertDBCampus = async (
  studentId: number,
  createCampus: CreateSavedCampus,
) => {
  const query = `
    INSERT INTO saved_campuses
      (student_id, college_id, meeting_place)
    VALUES
      ($1, $2, COALESCE($3, 'college campus'))
    RETURNING id, college_id, meeting_place, created_at, updated_at;
`;

  const { college_id, meeting_place } = createCampus;

  return db.query<Omit<SavedCampus, "student_id">>(query, [
    studentId,
    college_id,
    meeting_place ?? null,
  ]);
};

export const getDBCampusesWithCollege = async (studentId: number) => {
  const query = `
    SELECT
      s.id , s.college_id, s.meeting_place, s.created_at, s.updated_at,
      c.name AS college_name, c.code AS college_code, c.address AS college_address
    FROM saved_campuses as s
    LEFT JOIN colleges AS c ON s.college_id = c.id
    WHERE s.student_id = $1
    ORDER BY s.created_at DESC;
`;
  return db.query<Omit<SavedCampusWithCollege, "student_id">>(query, [
    studentId,
  ]);
};

export const getDBCampusById = async (studentId: number, campusId: number) => {
  const query = `
    SELECT
      s.id , s.college_id, s.meeting_place, s.created_at, s.updated_at,
      c.name AS college_name, c.code AS college_code, c.address AS college_address
    FROM saved_campuses AS s
    LEFT JOIN colleges AS c ON s.college_id = c.id
    WHERE s.id = $1 AND s.student_id = $2;
`;
  return db.query<Omit<SavedCampusWithCollege, "student_id">>(query, [
    campusId,
    studentId,
  ]);
};

export const getDBCampuses = (studentId: number) => {
  const query = `
    SELECT * FROM saved_campuses
      WHERE student_id = $1
`;
  return db.query<SavedCampus>(query, [studentId]);
};

export const getDBAssociatedBookCount = (
  studentId: number,
  campusId: number,
) => {
  const query = `
      SELECT COUNT(*) AS associated_count FROM books
        WHERE posted_by = $1 AND meeting_campus_id =$2;
    `;
  return db.query<{ associated_count: number }>(query, [studentId, campusId]);
};

export const deleteDBCampus = (studentId: number, campusId: number) => {
  const query = `
      DELETE FROM saved_campuses
        WHERE id = $1 AND student_id = $2;
`;
  return db.query(query, [campusId, studentId]);
};

export const updateBookWithAltCampus = (
  studentId: number,
  prevCampusId: number,
  altCampusId: number,
) => {
  const query = `
    UPDATE books SET  meeting_campus_id = $1
      WHERE posted_by = $2 AND meeting_campus_id = $3;
`;
  return db.query(query, [altCampusId, studentId, prevCampusId]);
};

export const updateDBCampus = async (
  studentId: number,
  campusId: number,
  patchBody: UpdateSavedCampus,
) => {
  const { meeting_place, college_id } = patchBody;
  const values = [
    meeting_place ?? null,
    college_id ?? null,
    studentId,
    campusId,
  ];
  const query = `
    UPDATE saved_campuses SET
      meeting_place = COALESCE($1, meeting_place),  college_id = COALESCE($2, college_id)
      WHERE student_id = $3 AND id = $4
      RETURNING *
`;
  return db.query<SavedCampus>(query, values);
};

export const getCollegeCountWithId = async (collegeId: number) => {
  const query = `
    SELECT COUNT(*) AS college_count FROM colleges
      WHERE id = $1;
`;
  return db.query<{ college_count: number }>(query, [collegeId]);
};

export const getDBAssociatedBooks = async (
  studentId: number,
  campusId: number,
) => {
  const query = `
    SELECT
      id, title, author, original_price, selling_price
    FROM books
      WHERE meeting_campus_id = $1 AND posted_by = $2;
`;

  return db.query<{
    id: number;
    title: string;
    author: string;
    original_price: number;
    selling_price: number;
  }>(query, [campusId, studentId]);
};
