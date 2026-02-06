import { createClient } from "@/lib/supabase/server";
import { getIsAdmin } from "@/lib/profile";
import { getApprovedAppsByIds } from "@/lib/apps";
import type { Collection, CollectionWithApps } from "@/types";

/** List all collections. Staff (owner_id null) first, then by updated_at desc. */
export async function getCollections(): Promise<Collection[]> {
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, owner_id, created_at, updated_at")
    .order("owner_id", { ascending: false, nullsFirst: true })
    .order("updated_at", { ascending: false });

  if (error) return [];
  return (data ?? []) as Collection[];
}

/** Get collection by slug with apps (approved public only, ordered by sort_order). */
export async function getCollectionBySlug(slug: string): Promise<CollectionWithApps | null> {
  const supabase = await createClient();
  const { data: coll, error } = await supabase
    .from("collections")
    .select("id, slug, name, description, owner_id, created_at, updated_at")
    .eq("slug", slug)
    .single();

  if (error || !coll) return null;

  const { data: rows, error: joinError } = await supabase
    .from("collection_apps")
    .select("app_id, sort_order")
    .eq("collection_id", coll.id)
    .order("sort_order", { ascending: true });

  if (joinError || !rows?.length) {
    return { ...(coll as Collection), apps: [] };
  }

  const appIds = (rows as { app_id: string; sort_order: number }[]).map((r) => r.app_id);
  const apps = await getApprovedAppsByIds(appIds);
  return { ...(coll as Collection), apps };
}

/** Create collection. owner_id null = staff (admin only). */
export async function createCollection(
  name: string,
  slug: string,
  description: string | null,
  ownerId: string | null
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to create a collection" };

  if (ownerId === null) {
    const isAdmin = await getIsAdmin(user.id);
    if (!isAdmin) return { error: "Only staff can create staff collections" };
  } else if (ownerId !== user.id) {
    return { error: "Invalid owner" };
  }

  const normalizedSlug = slug.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  const { error } = await supabase.from("collections").insert({
    slug: normalizedSlug || "collection",
    name: name.trim(),
    description: description?.trim() || null,
    owner_id: ownerId,
  });
  if (error) {
    if (error.code === "23505") return { error: "A collection with this slug already exists" };
    return { error: error.message };
  }
  return {};
}

/** Update collection name/description. */
export async function updateCollection(
  collectionId: string,
  updates: { name?: string; description?: string | null }
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to edit" };

  const { data: coll } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();
  if (!coll) return { error: "Collection not found" };
  const row = coll as { owner_id: string | null };
  const isAdmin = await getIsAdmin(user.id);
  if (row.owner_id !== null && row.owner_id !== user.id && !isAdmin)
    return { error: "You can only edit your own collections" };
  if (row.owner_id === null && !isAdmin) return { error: "Only staff can edit this collection" };

  const payload: { name?: string; description?: string | null; updated_at: string } = {
    updated_at: new Date().toISOString(),
  };
  if (updates.name !== undefined) payload.name = updates.name.trim();
  if (updates.description !== undefined) payload.description = updates.description?.trim() || null;

  const { error } = await supabase.from("collections").update(payload).eq("id", collectionId);
  if (error) return { error: error.message };
  return {};
}

/** Delete collection. */
export async function deleteCollection(collectionId: string): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to delete" };

  const { data: coll } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();
  if (!coll) return { error: "Collection not found" };
  const row = coll as { owner_id: string | null };
  const isAdmin = await getIsAdmin(user.id);
  if (row.owner_id !== null && row.owner_id !== user.id && !isAdmin)
    return { error: "You can only delete your own collections" };
  if (row.owner_id === null && !isAdmin) return { error: "Only staff can delete this collection" };

  const { error } = await supabase.from("collections").delete().eq("id", collectionId);
  if (error) return { error: error.message };
  return {};
}

/** Add app to collection. */
export async function addAppToCollection(
  collectionId: string,
  appId: string,
  sortOrder?: number
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to add apps" };

  const { data: coll } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();
  if (!coll) return { error: "Collection not found" };
  const row = coll as { owner_id: string | null };
  const isAdmin = await getIsAdmin(user.id);
  if (row.owner_id !== null && row.owner_id !== user.id && !isAdmin)
    return { error: "You can only add to your own collections" };
  if (row.owner_id === null && !isAdmin) return { error: "Only staff can add to this collection" };

  const nextOrder =
    sortOrder ??
    (async () => {
      const { data: max } = await supabase
        .from("collection_apps")
        .select("sort_order")
        .eq("collection_id", collectionId)
        .order("sort_order", { ascending: false })
        .limit(1)
        .single();
      return ((max as { sort_order: number } | null)?.sort_order ?? -1) + 1;
    })();
  const order = typeof nextOrder === "number" ? nextOrder : await nextOrder;

  const { error } = await supabase.from("collection_apps").insert({
    collection_id: collectionId,
    app_id: appId,
    sort_order: order,
  });
  if (error) {
    if (error.code === "23505") return { error: "App is already in this collection" };
    return { error: error.message };
  }
  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);
  return {};
}

/** Remove app from collection. */
export async function removeAppFromCollection(
  collectionId: string,
  appId: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: "Sign in to remove apps" };

  const { data: coll } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();
  if (!coll) return { error: "Collection not found" };
  const row = coll as { owner_id: string | null };
  const isAdmin = await getIsAdmin(user.id);
  if (row.owner_id !== null && row.owner_id !== user.id && !isAdmin)
    return { error: "You can only edit your own collections" };
  if (row.owner_id === null && !isAdmin) return { error: "Only staff can edit this collection" };

  const { error } = await supabase
    .from("collection_apps")
    .delete()
    .eq("collection_id", collectionId)
    .eq("app_id", appId);
  if (error) return { error: error.message };
  await supabase
    .from("collections")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", collectionId);
  return {};
}

/** Whether current user can edit this collection. */
export async function canEditCollection(
  collectionId: string,
  userId: string | null
): Promise<boolean> {
  if (!userId) return false;
  const supabase = await createClient();
  const { data } = await supabase
    .from("collections")
    .select("owner_id")
    .eq("id", collectionId)
    .single();
  if (!data) return false;
  const row = data as { owner_id: string | null };
  if (row.owner_id === userId) return true;
  if (row.owner_id === null) return getIsAdmin(userId);
  return false;
}

/** Add app to collection by app slug (approved public app). */
export async function addAppToCollectionBySlug(
  collectionId: string,
  appSlug: string
): Promise<{ error?: string }> {
  const supabase = await createClient();
  const { data: app, error: appError } = await supabase
    .from("apps")
    .select("id")
    .eq("slug", appSlug.trim())
    .eq("status", "approved")
    .eq("visibility", "public")
    .single();
  if (appError || !app) return { error: "Approved public app not found with that slug" };
  return addAppToCollection(collectionId, (app as { id: string }).id);
}
