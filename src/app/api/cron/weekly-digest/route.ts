import { NextResponse } from "next/server";
import { Resend } from "resend";
import { getDigestData, getDigestSubscribers, buildDigestHtml } from "@/lib/digest";
import { SITE_NAME } from "@/lib/constants";

const RESEND_FROM = process.env.RESEND_FROM ?? "DockOne <onboarding@resend.dev>";

export const maxDuration = 60;

/**
 * Weekly digest cron: "This week on DockOne".
 * Call with: Authorization: Bearer <CRON_SECRET> or x-cron-secret: <CRON_SECRET>
 * Set CRON_SECRET, RESEND_API_KEY, RESEND_FROM (e.g. DockOne <digest@yourdomain.com>), and SITE_URL.
 */
export async function POST(request: Request) {
  const secret =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret");
  const expected = process.env.CRON_SECRET;
  if (!expected || secret !== expected) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const baseUrl = process.env.SITE_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : "https://dockone.app";

  const [data, subscribers] = await Promise.all([
    getDigestData(),
    getDigestSubscribers(),
  ]);

  if (subscribers.length === 0) {
    return NextResponse.json({ ok: true, sent: 0, message: "No subscribers" });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[weekly-digest] RESEND_API_KEY not set; skipping send");
    return NextResponse.json({
      ok: true,
      sent: 0,
      message: "Resend not configured",
    });
  }

  const resend = new Resend(apiKey);
  const html = buildDigestHtml(data, baseUrl);
  const subject = `This week on ${SITE_NAME}`;

  let sent = 0;
  for (const sub of subscribers) {
    const { error } = await resend.emails.send({
      from: RESEND_FROM,
      to: sub.email,
      subject,
      html,
    });
    if (error) {
      console.error("[weekly-digest] send failed:", sub.email, error);
      continue;
    }
    sent++;
  }

  return NextResponse.json({ ok: true, sent, total: subscribers.length });
}
