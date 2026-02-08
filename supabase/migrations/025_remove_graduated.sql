-- Remove "Graduated" concept entirely: drop graduated_url column and clean seed taglines.

update public.apps set tagline = 'Archived for now.' where tagline = 'Graduated to product.';
update public.apps set tagline = 'Paused.' where tagline = 'Shipped elsewhere.';
update public.apps set tagline = 'On hold.' where tagline = 'Moved on.';

alter table public.apps drop column if exists graduated_url;
