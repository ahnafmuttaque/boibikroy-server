export const EDUCATION_YEARS = ["1st", "2nd", "3rd", "4th"] as const;

export type EducationYear = (typeof EDUCATION_YEARS)[number];

export type EducationLevel = {
  id: number;
  name: string;
  department: string;
  year: EducationYear;
  created_at: string;
};

// what is served publicly
export type PublicEducationLevel = Omit<EducationLevel, "created_at">;
