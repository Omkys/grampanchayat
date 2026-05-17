/** Shared client-side image validation for Storage uploads (leaders + officials). */

export const MAX_IMAGE_BYTES = 2 * 1024 * 1024; // 2MB

const ALLOWED_MIME = new Set(["image/jpeg", "image/png", "image/webp"]);
const ALLOWED_EXT = new Set(["jpg", "jpeg", "png", "webp"]);

function extensionOk(name: string): boolean {
  const ext = name.split(".").pop()?.toLowerCase();
  return !!ext && ALLOWED_EXT.has(ext);
}

/** @returns `null` if valid, otherwise a short error message for the UI. */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME.has(file.type)) {
    if (extensionOk(file.name) && (file.type === "" || file.type === "application/octet-stream")) {
      return "Could not read file type; please use JPG, PNG, or WebP.";
    }
    return "Only JPG, JPEG, PNG, or WebP images are allowed.";
  }
  if (!extensionOk(file.name)) {
    return "File extension must be .jpg, .jpeg, .png, or .webp.";
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return "Image must be 2MB or smaller.";
  }
  return null;
}
