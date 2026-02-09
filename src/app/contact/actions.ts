"use server";

import { createClient } from "@/lib/supabase/server";

export interface SubmitContactMessageResult {
  error?: string;
}

export async function submitContactMessage({
  email,
  message,
}: {
  email: string | null;
  message: string;
}): Promise<SubmitContactMessageResult> {
  if (!message || !message.trim()) {
    return { error: "Message is required." };
  }

  const supabase = await createClient();
  const { error } = await supabase.from("contact_messages").insert({
    email: email?.trim() || null,
    message: message.trim(),
    created_at: new Date().toISOString(),
  });

  if (error) {
    console.error("[contact] insert failed:", error);
    return { error: "Failed to send message. Please try again." };
  }

  return {};
}
