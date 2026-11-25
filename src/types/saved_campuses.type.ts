export const MAX_SAVED_CAMPUSES = 10;

export type SavedCampus = {
  id: number;
  student_id: number;
  college_id: number;
  meeting_place: string;
  created_at: string;
  updated_at: string;
};

export type SavedCampusWithCollege = SavedCampus & {
  college_code: string;
  college_name: string;
  college_address: string;
};
