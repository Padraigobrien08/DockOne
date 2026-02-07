-- Optional "Where it went" link for Graduated (shipped_elsewhere) projects.
-- e.g. GitHub repo, product page, startup site — DockOne becomes part of the project's story.

alter table public.apps
  add column if not exists graduated_url text;

comment on column public.apps.graduated_url is 'Optional URL when lifecycle = shipped_elsewhere: where the project went (GitHub, product, startup).';
