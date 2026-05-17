"use client";

import { useState } from "react";

type Props = {
  src: string | null | undefined;
  alt: string;
  size?: number;
  className?: string;
};

/**
 * Renders Supabase Storage public URLs with a plain <img> (reliable for any project host).
 * next/image remotePatterns are not required for these avatars.
 */
export default function StorageAvatar({ src, alt, size = 80, className = "" }: Props) {
  const [broken, setBroken] = useState(false);
  const url = src?.trim();
  const showFallback = !url || broken;

  return (
    <div
      className={`overflow-hidden rounded-full border-2 border-[#1f6f43]/70 bg-[#1f6f43]/10 flex items-center justify-center shadow-sm ${className}`}
      style={{ width: size, height: size }}
    >
      {showFallback ? (
        <span className="text-2xl text-[#1f6f43]/60" aria-hidden>
          👤
        </span>
      ) : (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={url}
          alt={alt}
          width={size}
          height={size}
          className="h-full w-full object-cover"
          loading="lazy"
          decoding="async"
          onError={() => setBroken(true)}
        />
      )}
    </div>
  );
}
