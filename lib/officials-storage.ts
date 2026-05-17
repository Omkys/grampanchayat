import type { SupabaseClient } from "@supabase/supabase-js";
import { removeImageFromStorage, uploadImageToStorage } from "@/lib/storage-upload";

export const OFFICIALS_STORAGE_BUCKET = "officials";

export const uploadOfficialPhotoToStorage = (supabase: SupabaseClient, file: File) =>
  uploadImageToStorage(supabase, OFFICIALS_STORAGE_BUCKET, file, "official");

export const removeOfficialPhotoFromStorage = (
  supabase: SupabaseClient,
  photoUrl: string | null | undefined
) => removeImageFromStorage(supabase, OFFICIALS_STORAGE_BUCKET, photoUrl);
