
ALTER TABLE public.reservations DROP CONSTRAINT IF EXISTS reservations_status_check;
ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_status_check
  CHECK (status IN ('pending','approved','confirmed','rejected','cancelled'));

CREATE EXTENSION IF NOT EXISTS btree_gist;

ALTER TABLE public.reservations
  ADD CONSTRAINT reservations_no_overlap
  EXCLUDE USING gist (
    room WITH =,
    date WITH =,
    tsrange((date + start_time), (date + end_time), '[)') WITH &&
  ) WHERE (status IN ('pending','approved','confirmed'));

CREATE OR REPLACE FUNCTION public.find_conflicts(
  _room text,
  _date date,
  _start time,
  _end time,
  _exclude uuid DEFAULT NULL
)
RETURNS TABLE (
  id uuid,
  event_name text,
  start_time time,
  end_time time,
  status text
)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT r.id, r.event_name, r.start_time, r.end_time, r.status
  FROM public.reservations r
  WHERE r.room = _room
    AND r.date = _date
    AND r.status IN ('pending','approved','confirmed')
    AND (_exclude IS NULL OR r.id <> _exclude)
    AND r.start_time < _end
    AND r.end_time   > _start
  ORDER BY r.start_time;
$$;

GRANT EXECUTE ON FUNCTION public.find_conflicts(text, date, time, time, uuid) TO authenticated;
