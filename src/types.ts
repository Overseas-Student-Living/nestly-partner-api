// src/types.ts
//
// Shapes of the records held in the in-memory store. These mirror the
// fixtures in src/data/ — if you add a field to the seed data, add it here
// too and the compiler will tell you everywhere that needs to handle it.

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string | null;
  phone: string | null;
  company_name: string | null;
  marketing_consent: boolean;
  created_at: string;
}

export type ListingStatus = "draft" | "published" | "unpublished";

export interface Amenity {
  name: string;
  status?: string;
}

export interface Floorplan {
  name: string;
  bedrooms?: number;
  bathrooms?: number;
  price_min?: number;
  price_max?: number;
  sqft_min?: number;
  sqft_max?: number;
}

export interface MediaItem {
  id: string;
  url: string;
  caption: string | null;
  image_type?: string | null;
  media_type?: string | null;
}

export interface Listing {
  id: string;
  owner_id: string;
  name: string;
  slug: string;
  status: ListingStatus;
  address: string;
  city: string | null;
  state: string | null;
  country: string | null;
  postal_code: string | null;
  latitude: number | null;
  longitude: number | null;
  nearest_university: string | null;
  distance_to_university_km: number | null;
  property_type: string | null;
  price_from: number | null;
  price_to: number | null;
  currency: string;
  billing_period: string;
  contact_phone: string | null;
  contact_email: string | null;
  website: string | null;
  contact_hidden: boolean;
  description: string | null;
  amenities: Amenity[];
  floorplans: Floorplan[];
  images: MediaItem[];
  avg_rating: number | null;
  review_count: number;
  created_at: string;
  updated_at: string;
}

export type LeadStatus = "new" | "responded" | "closed";

export interface Lead {
  id: string;
  listing_id: string;
  status: LeadStatus;
  name: string;
  email: string;
  phone: string | null;
  message: string;
  marketing_consent: boolean;
  created_at: string;
}

export interface Review {
  listing_id: string;
  rating: number | null;
  review_content: string;
  author_name: string;
  review_date: string;
  owner_answer: string | null;
  owner_timestamp: string | null;
}

export interface Task {
  id: string;
  [key: string]: unknown;
}

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: User;
      listing?: Listing;
    }
  }
}
