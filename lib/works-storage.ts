import type { SupabaseClient } from "@supabase/supabase-js";
import { removeImageFromStorage, uploadImageToStorage } from "@/lib/storage-upload";

export const WORKS_STORAGE_BUCKET = "works";

export const uploadWorkImageToStorage = (supabase: SupabaseClient, file: File) =>
  uploadImageToStorage(supabase, WORKS_STORAGE_BUCKET, file, "work");

export const removeWorkImageFromStorage = (
  supabase: SupabaseClient,
  imageUrl: string | null | undefined
) => removeImageFromStorage(supabase, WORKS_STORAGE_BUCKET, imageUrl);
