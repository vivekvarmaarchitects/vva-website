export type LocationJson = {
  location?: {
    locality?: string;
    city?: string;
    state?: string;
    country?: string;
  };
};

export type ProjectRecord = {
  collectionId: string;
  collectionName: string;
  id: string;
  slug: string;
  Name: string;
  Intro: string;
  seo_title?: string;
  seo_description?: string;
  seo_image?: string;
  seo_image_alt?: string;
  featured?: boolean;
  arc_window?: boolean;
  Location?: string;
  Sector?: string;
  Year?: string;
  Scope?: string;
  Image_1?: string[] | string;
  Image_2?: string[] | string;
  Title_1?: string;
  field_1?: string;
  created?: string;
  updated?: string;
  image_1_alt?: { image_1_alt?: string[] } | string[] | null;
  image_2_alt?: { image_2_alt?: string[] } | string[] | null;
  location_json?: LocationJson | null;
};
