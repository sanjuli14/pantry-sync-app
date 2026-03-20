export interface Item {
  id: number;
  title: string;
  description: string;
  zone: string;
  category: string;
  contact: string;
  image_url: string | null;
  imageUrl: string | null;
  image: string | null;
  img: string | null;
  latitude: number;
  longitude: number;
  user_id: number;
  created_at: string;
  expires_at: string;
}

export interface ItemCreate {
  title: string;
  description: string;
  zone: string;
  category: string;
  contact: string;
  latitude: number;
  longitude: number;
}

export interface NearbyItem {
  item: Item;
  distance_km: number;
}

export const CATEGORIES = [
  'Frutas/Vegetales',
  'Panadería',
  'Lácteos',
  'Enlatados',
  'Higiene',
  'Otros',
] as const;

export type Category = (typeof CATEGORIES)[number];
