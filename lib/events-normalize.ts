export function isMissingColumnError(message: string, column: string): boolean {
  return message.includes(`'${column}'`) && message.includes("does not exist");
}

export type EventDbPayload = {
  title_mr: string;
  title_en: string | null;
  event_date: string;
  description_mr: string | null;
  description_en: string | null;
  location: string | null;
  image_url: string | null;
  sort_order: number;
  registration_open: boolean;
  is_active: boolean;
};

/** Full row shape after events-setup.sql migration. */
export function eventPayloadForDb(form: EventDbPayload) {
  return { ...form };
}

/** Older events table without image_url / registration_open / sort_order. */
export function eventLegacyPayloadForDb(form: EventDbPayload) {
  return {
    title_mr: form.title_mr,
    title_en: form.title_en,
    event_date: form.event_date,
    description_mr: form.description_mr,
    description_en: form.description_en,
    location: form.location,
    is_active: form.is_active,
  };
}
