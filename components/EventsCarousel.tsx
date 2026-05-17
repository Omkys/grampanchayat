"use client";
import { useRef, useState, useEffect, useCallback } from "react";
import { useLivePoll } from "@/lib/use-live-poll";
import { motion, AnimatePresence } from "framer-motion";
import { CalendarDays, X } from "lucide-react";
import Link from "next/link";
import { useAuthContext } from "@/lib/AuthContext";
import { validateEventRegistration } from "@/lib/validate-event";
import { Button } from "@/components/ui/button";
import { sectionAnim } from "@/lib/section-anim";

const PLACEHOLDER_IMAGES = [
  "https://images.unsplash.com/photo-1529156069898-49953e39b3ac?w=600&h=400&fit=crop",
  "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop",
];

function fallbackImageForId(id: string) {
  let h = 0;
  for (let i = 0; i < id.length; i++) h += id.charCodeAt(i);
  return PLACEHOLDER_IMAGES[h % PLACEHOLDER_IMAGES.length];
}

export interface EventRow {
  id: string;
  title_mr: string;
  title_en: string | null;
  event_date: string | null;
  description_mr: string | null;
  description_en: string | null;
  location: string | null;
  image_url?: string | null;
  registration_open?: boolean | null;
  sort_order?: number | null;
}

function eventImageSrc(e: EventRow) {
  const url = e.image_url?.trim();
  return url || fallbackImageForId(e.id);
}

export default function EventsCarousel({ language }: { language: "mr" | "en" }) {
  const ref = useRef<HTMLDivElement>(null);
  const { user } = useAuthContext();
  const [items, setItems] = useState<EventRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [active, setActive] = useState<EventRow | null>(null);

  const [regName, setRegName] = useState("");
  const [regMobile, setRegMobile] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regError, setRegError] = useState<string | null>(null);
  const [regSuccess, setRegSuccess] = useState(false);
  const [regSubmitting, setRegSubmitting] = useState(false);

  const loadEvents = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    if (!silent) setError(null);
    try {
      const res = await fetch("/api/events", { cache: "no-store" });
      const body = await res.json().catch(() => null);
      if (!res.ok) {
        const msg =
          body && typeof body === "object" && "error" in body && typeof body.error === "string"
            ? body.error
            : "Failed to load events";
        setError(msg);
        setItems([]);
        return;
      }
      const data = body as EventRow[];
      const rows = Array.isArray(data) ? data : [];
      rows.sort((a, b) => (Number(a.sort_order) || 0) - (Number(b.sort_order) || 0));
      setItems(rows);
    } catch {
      setError("Failed to load events");
      setItems([]);
    } finally {
      if (!silent) setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadEvents(false);
  }, [loadEvents]);

  useLivePoll(() => loadEvents(true), { runOnMount: false });

  useEffect(() => {
    if (!active) {
      setRegName("");
      setRegMobile("");
      setRegEmail("");
      setRegError(null);
      setRegSuccess(false);
      return;
    }
    setRegName(user?.full_name || "");
    setRegMobile(user?.mobile || "");
    setRegEmail(user?.email || "");
    setRegError(null);
    setRegSuccess(false);
  }, [active, user]);

  const scroll = (dir: "left" | "right") => ref.current?.scrollBy({ left: dir === "left" ? -350 : 350, behavior: "smooth" });

  const title = (e: EventRow) => (language === "mr" ? e.title_mr || e.title_en || "" : e.title_en || e.title_mr || "");
  const desc = (e: EventRow) =>
    language === "mr" ? e.description_mr || e.description_en || "" : e.description_en || e.description_mr || "";
  const heading = language === "mr" ? "कार्यक्रम" : "Events";
  const dateLabel = language === "mr" ? "दिनांक" : "Date";
  const locLabel = language === "mr" ? "ठिकाण" : "Location";
  const emptyMsg = language === "mr" ? "सध्या कोणतेही कार्यक्रम नाहीत." : "No events scheduled yet.";
  const hiddenHint =
    language === "mr"
      ? "डॅशबोर्डमध्ये कार्यक्रम दिसतात पण येथे नाहीत? Supabase मध्ये supabase/full-setup.sql चालवा आणि .env मध्ये SUPABASE_SERVICE_ROLE_KEY जतन करून dev server पुन्हा सुरू करा."
      : "Events show in the dashboard but not here? Run supabase/full-setup.sql in Supabase, save SUPABASE_SERVICE_ROLE_KEY in .env, and restart npm run dev.";
  const registerLabel = language === "mr" ? "नोंदणी करा" : "Register";
  const namePh = language === "mr" ? "पूर्ण नाव" : "Full name";
  const mobilePh = language === "mr" ? "मोबाईल (10 अंक)" : "Mobile (10 digits)";
  const emailPh = language === "mr" ? "ईमेल (ऐच्छिक)" : "Email (optional)";

  const formatDate = (d: string | null) => {
    if (!d) return "—";
    try {
      return new Date(d).toLocaleDateString(language === "mr" ? "mr-IN" : "en-IN", { dateStyle: "medium" });
    } catch {
      return d;
    }
  };

  const submitRegistration = async () => {
    if (!active) return;
    setRegError(null);
    const validationError = validateEventRegistration({
      full_name: regName,
      mobile: regMobile,
      email: regEmail,
    });
    if (validationError) {
      setRegError(validationError);
      return;
    }

    setRegSubmitting(true);
    try {
      const res = await fetch("/api/events/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          event_id: active.id,
          full_name: regName.trim(),
          mobile: regMobile,
          email: regEmail.trim() || undefined,
          profile_id: user?.id || null,
        }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) {
        setRegError(typeof body.error === "string" ? body.error : "Registration failed");
        return;
      }
      setRegSuccess(true);
    } catch {
      setRegError("Registration failed. Please try again.");
    } finally {
      setRegSubmitting(false);
    }
  };

  const registrationOpen = active?.registration_open !== false;

  return (
    <motion.section id="events" className="py-14 px-6 bg-[#fff7ed] relative" {...sectionAnim}>
      <h3 className="text-2xl font-semibold text-center mb-6 text-[#1f6f43] flex items-center justify-center gap-2">
        <CalendarDays size={20} /> {heading}
      </h3>
      {error && <p className="text-center text-sm text-red-600 mb-4">{error}</p>}
      {loading ? (
        <p className="text-center text-gray-500 text-sm py-8">{language === "mr" ? "लोड होत आहे…" : "Loading…"}</p>
      ) : items.length === 0 ? (
        <motion.div className="text-center text-gray-500 text-sm py-8 px-4 max-w-xl mx-auto space-y-2" animate={{ opacity: 1 }}>
          <p>{emptyMsg}</p>
          <p className="text-xs text-amber-800/80 bg-amber-50 border border-amber-200 rounded-lg p-3">{hiddenHint}</p>
        </motion.div>
      ) : (
        <div className="relative">
          <button type="button" onClick={() => scroll("left")} className="absolute left-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">‹</button>
          <div ref={ref} className="flex gap-6 overflow-x-auto scroll-smooth px-10" style={{ scrollbarWidth: "none" }}>
            {items.map((e) => (
              <div
                key={e.id}
                onClick={() => setActive(e)}
                className="min-w-[300px] md:min-w-[350px] h-56 rounded-xl overflow-hidden relative shadow-md cursor-pointer hover:scale-[1.02] transition shrink-0"
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={eventImageSrc(e)} className="w-full h-full object-cover" alt={title(e)} loading="lazy" />
                <div className="absolute inset-0 bg-black/40 flex items-end">
                  <h4 className="text-white font-semibold p-4 line-clamp-2">{title(e)}</h4>
                </div>
              </div>
            ))}
          </div>
          <button type="button" onClick={() => scroll("right")} className="absolute right-0 top-1/2 -translate-y-1/2 bg-white shadow p-2 rounded-full z-10 cursor-pointer">›</button>
        </div>
      )}

      <AnimatePresence>
        {active && (
          <motion.div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4" onClick={() => setActive(null)}>
            <motion.div
              className="bg-white p-6 rounded-xl w-full max-w-lg relative max-h-[90vh] overflow-y-auto"
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              onClick={(ev) => ev.stopPropagation()}
            >
              <button type="button" className="absolute top-3 right-3 cursor-pointer z-10" onClick={() => setActive(null)}>
                <X size={18} />
              </button>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={eventImageSrc(active)} alt={title(active)} className="w-full h-40 object-cover rounded-lg mb-4" />
              <h3 className="text-lg font-semibold mb-1 text-[#1f6f43] pr-8">{title(active)}</h3>
              <p className="text-xs text-gray-500 mb-2">
                {dateLabel}: {formatDate(active.event_date)}
              </p>
              {active.location ? (
                <p className="text-sm mb-2">
                  <strong>{locLabel}:</strong> {active.location}
                </p>
              ) : null}
              <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-line mb-4">{desc(active) || "—"}</p>

              {registrationOpen ? (
                <div className="border-t pt-4 space-y-3">
                  <h4 className="text-sm font-semibold text-[#1f6f43]">{registerLabel}</h4>
                  {regSuccess ? (
                    <p className="text-sm text-green-700 bg-green-50 rounded-lg p-3">
                      {language === "mr"
                        ? "नोंदणी यशस्वी! आपण या कार्यक्रमासाठी नोंदणीकृत आहात."
                        : "Registration successful! You are registered for this event."}
                    </p>
                  ) : (
                    <>
                      <input
                        type="text"
                        placeholder={namePh}
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        disabled={regSubmitting}
                      />
                      <input
                        type="tel"
                        placeholder={mobilePh}
                        value={regMobile}
                        onChange={(e) => setRegMobile(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        maxLength={14}
                        disabled={regSubmitting}
                      />
                      <input
                        type="email"
                        placeholder={emailPh}
                        value={regEmail}
                        onChange={(e) => setRegEmail(e.target.value)}
                        className="w-full border rounded-md px-3 py-2 text-sm"
                        disabled={regSubmitting}
                      />
                      {regError && <p className="text-xs text-red-600">{regError}</p>}
                      <Button
                        className="w-full bg-[#1f6f43] text-white"
                        onClick={() => void submitRegistration()}
                        disabled={regSubmitting}
                      >
                        {regSubmitting
                          ? language === "mr"
                            ? "सबमिट होत आहे…"
                            : "Submitting…"
                          : registerLabel}
                      </Button>
                      {!user && (
                        <p className="text-xs text-gray-500 text-center">
                          <Link href="/login" className="text-[#1f6f43] underline">
                            {language === "mr" ? "लॉगिन" : "Login"}
                          </Link>
                          {language === "mr" ? " करून नोंदणी जतन करा." : " to save your details for next time."}
                        </p>
                      )}
                    </>
                  )}
                </div>
              ) : (
                <p className="text-sm text-amber-700 bg-amber-50 rounded-lg p-3">
                  {language === "mr" ? "या कार्यक्रमासाठी नोंदणी बंद आहे." : "Registration is closed for this event."}
                </p>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.section>
  );
}
