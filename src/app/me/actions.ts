"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

const USERNAME_MIN = 3;
const USERNAME_MAX = 30;
const USERNAME_REGEX = /^[a-zA-Z0-9_]+$/;
const DISPLAY_NAME_MAX = 100;
const BIO_MAX = 500;
const AVATAR_MAX_BYTES = 2 * 1024 * 1024; // 2MB
const AVATAR_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export type ProfileFormState = {
  error?: string;
  fieldErrors?: { username?: string; display_name?: string; bio?: string };
};

export async function updateProfile(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const username = (formData.get("username") as string)?.trim() ?? "";
  const display_name = (formData.get("display_name") as string)?.trim() ?? "";
  const bio = (formData.get("bio") as string)?.trim() ?? "";

  const fieldErrors: ProfileFormState["fieldErrors"] = {};

  if (!username) {
    fieldErrors.username = "Username is required.";
  } else if (username.length < USERNAME_MIN || username.length > USERNAME_MAX) {
    fieldErrors.username = `Username must be ${USERNAME_MIN}–${USERNAME_MAX} characters.`;
  } else if (!USERNAME_REGEX.test(username)) {
    fieldErrors.username = "Username can only use letters, numbers, and underscores.";
  }

  if (display_name.length > DISPLAY_NAME_MAX) {
    fieldErrors.display_name = `Display name must be at most ${DISPLAY_NAME_MAX} characters.`;
  }

  if (bio.length > BIO_MAX) {
    fieldErrors.bio = `Bio must be at most ${BIO_MAX} characters.`;
  }

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  const { error } = await supabase
    .from("profiles")
    .update({ username, display_name: display_name || null, bio: bio || null })
    .eq("id", user.id);

  if (error) {
    if (error.code === "23505") {
      return { fieldErrors: { username: "That username is already taken." } };
    }
    return { error: error.message };
  }

  revalidatePath("/me");
  revalidatePath("/");
  return {};
}

export async function uploadAvatar(
  _prev: ProfileFormState,
  formData: FormData
): Promise<ProfileFormState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    redirect("/auth/sign-in");
  }

  const file = formData.get("avatar") as File | null;
  if (!file || file.size === 0) {
    return { error: "Please choose an image." };
  }

  if (!AVATAR_ALLOWED_TYPES.includes(file.type)) {
    return { error: "Image must be JPEG, PNG, or WebP." };
  }
  if (file.size > AVATAR_MAX_BYTES) {
    return { error: "Image must be 2MB or smaller." };
  }

  const ext = file.name.split(".").pop() || "jpg";
  const path = `${user.id}/${crypto.randomUUID()}.${ext}`;

  const buffer = Buffer.from(await file.arrayBuffer());

  const { error: uploadError } = await supabase.storage.from("avatars").upload(path, buffer, {
    contentType: file.type,
    upsert: true,
  });

  if (uploadError) {
    return { error: uploadError.message };
  }

  const {
    data: { publicUrl },
  } = supabase.storage.from("avatars").getPublicUrl(path);

  const { error: updateError } = await supabase
    .from("profiles")
    .update({ avatar_url: publicUrl })
    .eq("id", user.id);

  if (updateError) {
    return { error: updateError.message };
  }

  revalidatePath("/me");
  revalidatePath("/");
  return {};
}
