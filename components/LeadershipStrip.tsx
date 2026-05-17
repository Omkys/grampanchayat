"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { LeaderRow } from "@/lib/leaders";
import StorageAvatar from "@/components/StorageAvatar";
import { matchLeaderPreset } from "@/lib/position-options";
import { useLivePoll } from "@/lib/use-live-poll";
import { sectionAnim } from "@/lib/section-anim";

function LeaderCard({ leader, language }: { leader: LeaderRow; language: "mr" | "en" }) {
  const preset = matchLeaderPreset(leader.designation);
  const roleLabel =
    language === "mr" ? preset?.labelMr ?? leader.designation : preset?.labelEn ?? leader.designation;

  return (
    <div className="flex flex-col items-center max-w-[140px]">
      <StorageAvatar src={leader.image_url} alt={leader.name} size={80} />
      <p className="text-xs font-semibold mt-2 text-gray-800 text-center leading-snug">{leader.name}</p>
      <p className="text-[11px] text-gray-600 text-center leading-snug">{roleLabel}</p>
    </div>
  );
}

export default function LeadershipStrip({ language = "mr" }: { language?: "mr" | "en" }) {
  const [leaders, setLeaders] = useState<LeaderRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadLeaders = useCallback(async (silent = false) => {
    if (!silent) {
      setLoading(true);
      setError(null);
    }
    try {
      const res = await fetch("/api/leaders", { cache: "no-store" });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(typeof body.error === "string" ? body.error : "Failed to load leaders");
      }
      const body = await res.json();
      if (body && typeof body === "object" && "error" in body && typeof body.error === "string") {
        throw new Error(body.error);
      }
      const data = body as LeaderRow[];
      setLeaders(Array.isArray(data) ? data : []);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load leaders");
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadLeaders(false);
  }, [loadLeaders]);

  useLivePoll(() => loadLeaders(true), { runOnMount: false });

  return (
    <motion.section id="leadership" className="py-6 px-6 bg-white" {...sectionAnim}>
      <div className="max-w-6xl mx-auto">
        {error && <p className="text-center text-sm text-red-600 mb-3">{error}</p>}
        {loading ? (
          <p className="text-center text-sm text-gray-500 py-4">Loading leaders…</p>
        ) : error ? null : leaders.length === 0 ? (
          <p className="text-center text-sm text-gray-500 py-4">
            No active leaders to show. In admin → Leaders, add a record, upload a photo, and check &quot;Active on
            homepage&quot;.
          </p>
        ) : (
          <div className="flex flex-wrap justify-center sm:justify-between gap-8 gap-y-10 items-start">
            {leaders.map((leader) => (
              <LeaderCard key={leader.id} leader={leader} language={language} />
            ))}
          </div>
        )}
      </div>
    </motion.section>
  );
}
