/** Client/server helpers for event forms and registrations. */

const MOBILE_RE = /^[6-9]\d{9}$/;

export function validateEventForm(form: {
  title_mr: string;
  event_date: string;
  image_url: string | null;
  /** True when user picked a file in the upload field (image not uploaded yet). */
  hasPendingFile?: boolean;
  isNew: boolean;
}): string | null {
  if (!form.title_mr.trim()) return "Marathi title is required.";
  if (!form.event_date) return "Event date is required.";
  if (form.isNew && !form.image_url && !form.hasPendingFile) {
    return "Please choose an event photo before saving.";
  }
  return null;
}

export function validateEventRegistration(form: {
  full_name: string;
  mobile: string;
  email?: string;
}): string | null {
  if (!form.full_name.trim()) return "Full name is required.";
  const mobile = form.mobile.replace(/\D/g, "");
  if (mobile.length !== 10 || !MOBILE_RE.test(mobile)) {
    return "Enter a valid 10-digit Indian mobile number.";
  }
  if (form.email?.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    return "Enter a valid email address.";
  }
  return null;
}

export function normalizeMobile(mobile: string): string {
  return mobile.replace(/\D/g, "").slice(-10);
}
