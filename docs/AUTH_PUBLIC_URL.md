# Auth setup for your public URL

After you add a public URL (e.g. `https://dockone.app` or a custom domain), do these so magic link and Google sign-in work.

---

## 1. Supabase Dashboard — Site URL and Redirect URLs

1. Open [Supabase Dashboard](https://supabase.com/dashboard) → your project.
2. Go to **Authentication** → **URL Configuration**.
3. Set **Site URL** to your public URL, e.g. `https://dockone.app` (no trailing slash).
4. Under **Redirect URLs**, add:
   - `https://your-public-url.com/auth/callback`
   - `https://your-public-url.com/**`  
   (Replace `your-public-url.com` with your real domain.)
5. Keep `http://localhost:3000/auth/callback` and `http://localhost:3000/**` if you still use local dev.
6. Save.

---

## 2. Google Cloud Console — OAuth (if you use “Sign in with Google”)

1. Open [Google Cloud Console](https://console.cloud.google.com/apis/credentials) → your project (or the one used for DockOne).
2. Open the **OAuth 2.0 Client ID** used for Supabase (Web application type).
3. Under **Authorized JavaScript origins**, add:
   - `https://your-public-url.com`  
   (and keep `http://localhost:3000` for local dev if needed).
4. Under **Authorized redirect URIs**, add:
   - `https://your-public-url.com/auth/callback`  
   (Supabase uses this for the OAuth callback; the exact redirect is shown in Supabase → Authentication → Providers → Google as “Callback URL (for OAuth)”).
5. Save.

---

## 3. Host (e.g. Vercel) — Environment and domain

1. In **Vercel** (or your host): **Project** → **Settings** → **Environment Variables**.
2. Ensure **Production** (and Preview if you use it) has:
   - `NEXT_PUBLIC_SUPABASE_URL` — your Supabase project URL.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase anon key.
3. Under **Settings** → **Domains**, add your public URL and set it as primary if needed.
4. Redeploy after changing env or domain so the new URL is used.

---

## 4. Quick check

1. Open your site at the public URL.
2. **Magic link**: Use “Send magic link” with your email; open the link from the email; you should land back on the site and be signed in.
3. **Google**: Click “Sign in with Google” (on the sign-in page or hero); complete Google sign-in; you should land back on the site and be signed in.

If magic link fails, Supabase redirect URLs or Site URL are wrong. If Google fails, check Google Console redirect URIs and origins, and that the Supabase Google provider Client ID/Secret match.
