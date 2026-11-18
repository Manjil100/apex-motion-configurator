export type ContactFields = { name: string; email: string; subject: string; message: string };
export type ContactErrors = Partial<Record<keyof ContactFields, string>>;

/** Shared by the form and the server action. The database enforces the same limits again. */
export function validateContact(v: ContactFields): ContactErrors {
  const errors: ContactErrors = {};
  const name = v.name.trim();
  const email = v.email.trim();
  if (name.length < 2 || name.length > 80) errors.name = "Enter your name (2 to 80 characters).";
  if (email.length > 254 || !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email)) errors.email = "Enter an email address like name@example.com.";
  if (v.subject.trim().length < 3 || v.subject.trim().length > 120) errors.subject = "Add a subject of 3 to 120 characters.";
  if (v.message.trim().length < 20) errors.message = "Write a message of at least 20 characters.";
  if (v.message.trim().length > 2000) errors.message = "Keep your message under 2,000 characters.";
  return errors;
}
