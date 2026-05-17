import type { SupabaseClient } from "@supabase/supabase-js";
import { removeImageFromStorage, uploadImageToStorage } from "@/lib/storage-upload";

export const LEADERS_STORAGE_BUCKET = "leaders";

/** Matches Supabase `leaders` table (name, designation, image_url, display_order, is_active). */
export type LeaderRow = {
  id: string;
  name: string;
  designation: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
  created_at?: string;
};

export type LeaderFormPayload = {
  name: string;
  designation: string;
  image_url: string | null;
  display_order: number;
  is_active: boolean;
};

export const uploadLeaderImageToStorage = (supabase: SupabaseClient, file: File) =>
  uploadImageToStorage(supabase, LEADERS_STORAGE_BUCKET, file, "leader");

export const removeLeaderImageFromStorage = (
  supabase: SupabaseClient,
  imageUrl: string | null | undefined
) => removeImageFromStorage(supabase, LEADERS_STORAGE_BUCKET, imageUrl);
