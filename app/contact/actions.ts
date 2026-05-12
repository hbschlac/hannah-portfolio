"use server";

import { Resend } from "resend";
import { getResendKey } from "@/lib/resend-key";

export type ContactState = {
  success?: boolean;
  error?: string;
};

export async function sendContactEmail(
  _prev: ContactState,
  formData: FormData
): Promise<ContactState> {
  const name = (formData.get("name") as string)?.trim();
  const email = (formData.get("email") as string)?.trim();
  const message = (formData.get("message") as string)?.trim();

  if (!name || !email || !message) {
    return { error: "all fields are required." };
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return { error: "please enter a valid email address." };
  }

  const apiKey = getResendKey();
  if (!apiKey) {
    return { error: "email service not configured." };
  }

  const resend = new Resend(apiKey);

  const { error } = await resend.emails.send({
    from: "schlacter.me <contact@schlacter.me>",
    to: "hbschlac@gmail.com",
    replyTo: email,
    subject: `message from ${name} via schlacter.me`,
    text: `From: ${name} <${email}>\n\n${message}`,
    html: `<p><strong>From:</strong> ${name} &lt;${email}&gt;</p><p>${message.replace(/\n/g, "<br>")}</p>`,
  });

  if (error) {
    return { error: "something went wrong. try again in a moment." };
  }

  return { success: true };
}
