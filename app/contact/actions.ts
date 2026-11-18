"use server";

import { createServerSupabase } from "@/lib/supabase/server";
import { validateContact, type ContactErrors, type ContactFields } from "@/lib/validation/contact";

export type EnquiryResult = { ok: true } | { ok: false; errors?: ContactErrors; message?: string };

const text = (v: FormDataEntryValue | null, max: number) => (typeof v === "string" ? v.slice(0, max) : "");

/** Validates again on the server (never trust the browser), then stores the enquiry. */
export async function sendEnquiry(formData: FormData): Promise<EnquiryResult> {
  // Honeypot: people never see this field; simple bots fill it in.
  if (text(formData.get("company"), 200)) return { ok: true };

  const fields: ContactFields = {
    name: text(formData.get("name"), 200),
    email: text(formData.get("email"), 300),
    subject: text(formData.get("subject"), 300),
    message: text(formData.get("message"), 4000),
  };
  const errors = validateContact(fields);
  if (Object.keys(errors).length) return { ok: false, errors };

  const supabase = await createServerSupabase();
  if (!supabase) return { ok: false, message: "Messages can't be sent from this copy of the site: it has no database settings." };

  const { data: claims } = await supabase.auth.getClaims().catch(() => ({ data: null }));
  const { error } = await supabase.from("enquiries").insert({
    name: fields.name.trim(),
    email: fields.email.trim(),
    subject: fields.subject.trim(),
    message: fields.message.trim(),
    user_id: (claims?.claims?.sub as string | undefined) ?? null,
  });
  if (error) {
    console.error("enquiry insert failed", error.message);
    return { ok: false, message: "Your message was not sent because the server could not store it. Try again in a few minutes." };
  }
  return { ok: true };
}
