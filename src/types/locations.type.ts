// what is served publicly for each location level
export type Division = {
  id: number;
  name_en: string;
  bn_name: string;
};

export type District = {
  id: number;
  division_id: number;
  name_en: string;
  bn_name: string;
};

export type Upazila = {
  id: number;
  district_id: number;
  name_en: string;
  bn_name: string;
};
