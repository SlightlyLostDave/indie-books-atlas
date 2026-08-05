export interface StoreFeatureProperties {
  slug: string;
  name: string;
  short_description: string | null;
  specialties: string[] | null;
  data_quality_score: number;
  city: string | null;
  province: string | null;
}

export interface StoreFeature {
  type: "Feature";
  geometry: {
    type: "Point";
    coordinates: [number, number];
  };
  properties: StoreFeatureProperties;
}

export interface StoreFeatureCollection {
  type: "FeatureCollection";
  features: StoreFeature[];
}
