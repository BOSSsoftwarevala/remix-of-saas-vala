-- Public category list for signed-out marketplace visitors.
--
-- products already has "Public can view marketplace products" (marketplace_visible +
-- active), but categories was readable only by resellers and super admins, so the
-- category filter on the public marketplace came back empty for anyone not signed in.

DROP POLICY IF EXISTS "Anyone can view active categories" ON public.categories;

CREATE POLICY "Anyone can view active categories"
  ON public.categories
  FOR SELECT
  TO public
  USING (is_active = true);
