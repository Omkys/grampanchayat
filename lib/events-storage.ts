import type { SupabaseClient } from "@supabase/supabase-js";
import { removeImageFromStorage, uploadImageToStorage } from "@/lib/storage-upload";

export const EVENTS_STORAGE_BUCKET = "events";

export const uploadEventImageToStorage = (supabase: SupabaseClient, file: File) =>
  uploadImageToStorage(supabase, EVENTS_STORAGE_BUCKET, file, "event");

export const removeEventImageFromStorage = (
  supabase: SupabaseClient,
  imageUrl: string | null | undefined
) => removeImageFromStorage(supabase, EVENTS_STORAGE_BUCKET, imageUrl);
