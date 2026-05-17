import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Parse object path inside a public Supabase Storage bucket from its public URL.
 * Example: https://<ref>.supabase.co/storage/v1/object/public/leaders/abc.jpg → abc.jpg
 */
export function getStorageObjectPathFromPublicUrl(bucket: string, publicUrl: string): string | null {
  const marker = `/object/public/${bucket}/`;
  const idx = publicUrl.indexOf(marker);
  if (idx === -1) return null;
  try {
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
  } catch {
    return null;
  }
}

/** Unique object name: prefix + timestamp + random + extension. */
export function buildStorageObjectPath(file: File, prefix = ""): string {
  const ext = file.name.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = ["jpg", "jpeg", "png", "webp"].includes(ext) ? ext : "jpg";
  const id = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}`;
  const base = prefix ? `${prefix}-${Date.now()}-${id}` : `${Date.now()}-${id}`;
  return `${base}.${safeExt}`;
}

/**
 * Upload flow:
 * 1. Validate file in the UI (validateImageFile).
 * 2. uploadImageToStorage → bucket with unique path.
 * 3. getPublicUrl → store URL in Postgres (image_url / photo_url).
 */
export async function uploadImageToStorage(
  supabase: SupabaseClient,
  bucket: string,
  file: File,
  prefix?: string
): Promise<{ publicUrl: string } | { error: string }> {
  const objectPath = buildStorageObjectPath(file, prefix);

  const { data, error } = await supabase.storage.from(bucket).upload(objectPath, file, {
    cacheControl: "3600",
    upsert: false,
  });

  if (error) return { error: error.message };

  const {
    data: { publicUrl },
  } = supabase.storage.from(bucket).getPublicUrl(data.path);

  return { publicUrl };
}

/** Best-effort delete of a Storage object from its public URL. */
export async function removeImageFromStorage(
  supabase: SupabaseClient,
  bucket: string,
  publicUrl: string | null | undefined
): Promise<void> {
  const path = publicUrl ? getStorageObjectPathFromPublicUrl(bucket, publicUrl) : null;
  if (!path) return;
  await supabase.storage.from(bucket).remove([path]);
}
