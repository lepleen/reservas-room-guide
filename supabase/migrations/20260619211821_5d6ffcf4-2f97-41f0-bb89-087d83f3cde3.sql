CREATE INDEX IF NOT EXISTS reservations_status_idx
  ON public.reservations (status)
  WHERE status IN ('pending','approved','confirmed');