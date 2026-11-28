export type College = {
  id: number;
  code: string;
  name: string;
  email: string;
  approved: "1" | "0";
  address: string;
  upazila: string;
  district: string;
  division: string;
  created_at: string;
  updated_at: string;
};

// what is served publicly
export type PublicCollege = Pick<
  College,
  "id" | "code" | "name" | "address" | "upazila" | "district" | "division"
>;
