ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_no_overlap;
DROP EXTENSION IF EXISTS btree_gist;
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS btree_gist WITH SCHEMA extensions;
GRANT USAGE ON SCHEMA extensions TO anon, authenticated, service_role;
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_no_overlap
  EXCLUDE USING gist (
    room WITH =,
    date WITH =,
    tsrange((date + start_time), (date + end_time), '[)') WITH &&
  ) WHERE (status IN ('pending','approved','confirmed'));
REVOKE ALL ON FUNCTION public.find_conflicts(text, date, time, time, uuid) FROM PUBLIC;
REVOKE ALL ON FUNCTION public.find_conflicts(text, date, time, time, uuid) FROM anon;
GRANT EXECUTE ON FUNCTION public.find_conflicts(text, date, time, time, uuid) TO authenticated;