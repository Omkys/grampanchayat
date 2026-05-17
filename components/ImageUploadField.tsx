"use client";

import { useEffect, useState } from "react";
import { validateImageFile, MAX_IMAGE_BYTES } from "@/lib/validate-image";

type Props = {
  label?: string;
  currentUrl?: string | null;
  file: File | null;
  fileError: string | null;
  onFileChange: (file: File | null, error: string | null) => void;
  disabled?: boolean;
  /** Tailwind classes for the preview image (default: small round avatar). */
  previewClassName?: string;
};

/** File input with MIME/size validation and local preview before upload. */
export default function ImageUploadField({
  label = "Profile image",
  currentUrl,
  file,
  fileError,
  onFileChange,
  disabled,
  previewClassName = "h-16 w-16 rounded-full object-cover border-2 border-[#1f6f43]/50",
}: Props) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [file]);

  const displayUrl = previewUrl || currentUrl || null;

  const handleChange = (f: File | null) => {
    if (!f) {
      onFileChange(null, null);
      return;
    }
    const err = validateImageFile(f);
    onFileChange(err ? null : f, err);
  };

  return (
    <div className="flex flex-col gap-1">
      <label className="text-xs font-medium text-gray-600">{label}</label>
      <p className="text-[11px] text-gray-500">JPG, PNG, or WebP — max {MAX_IMAGE_BYTES / (1024 * 1024)}MB</p>
      <input
        type="file"
        accept="image/jpeg,image/png,image/webp,.jpg,.jpeg,.png,.webp"
        disabled={disabled}
        onChange={(e) => handleChange(e.target.files?.[0] ?? null)}
        className="border rounded px-3 py-2 text-sm bg-white disabled:opacity-50"
      />
      {fileError && <p className="text-xs text-red-600">{fileError}</p>}
      {displayUrl && (
        <div className="mt-2 flex items-center gap-3">
          {/* eslint-disable-next-line @next/next/no-img-element -- blob: preview before upload */}
          <img
            src={displayUrl}
            alt="Preview"
            className={previewClassName}
          />
          <span className="text-xs text-gray-500">{previewUrl ? "New image (not saved yet)" : "Current image"}</span>
        </div>
      )}
    </div>
  );
}
