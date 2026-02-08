import { NextRequest, NextResponse } from "next/server";
import { performAppEdit } from "@/app/apps/[slug]/edit/actions";

/**
 * POST /api/apps/[slug]/edit — accept multipart form data so file uploads (screenshots, logo) are sent.
 * Use this as the edit form action so screenshots are stored; Server Actions with useActionState can omit files.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;
  const formData = await request.formData();
  formData.set("slug", slug);

  const result = await performAppEdit(formData);

  if (result.ok) {
    return NextResponse.redirect(new URL(`/apps/${result.slug}`, request.url), 303);
  }

  const errorMessage = result.error ?? (result.fieldErrors && Object.values(result.fieldErrors)[0]) ?? "Update failed.";
  const editUrl = new URL(`/apps/${slug}/edit`, request.url);
  editUrl.searchParams.set("error", errorMessage);
  return NextResponse.redirect(editUrl, 303);
}
