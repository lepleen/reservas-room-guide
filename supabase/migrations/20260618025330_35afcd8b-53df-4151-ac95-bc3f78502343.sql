
CREATE TABLE public.reservations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  kind text NOT NULL DEFAULT 'user' CHECK (kind IN ('user','internal')),
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','approved','rejected')),

  organizer_name text NOT NULL,
  job_title text NOT NULL,
  phone text NOT NULL,
  brand text NOT NULL,
  cnpj text NOT NULL,

  event_name text NOT NULL,
  event_type text NOT NULL CHECK (event_type IN ('in_person','live_broadcast','recorded')),
  broadcast_platform text CHECK (broadcast_platform IN ('YouTube','Microsoft Teams','Zoom')),
  date date NOT NULL,
  start_time time NOT NULL,
  end_time time NOT NULL,
  attendees int NOT NULL CHECK (attendees > 0),
  setup_option_id text NOT NULL,
  room text NOT NULL,
  max_capacity int,

  catering boolean NOT NULL DEFAULT false,
  catering_items jsonb NOT NULL DEFAULT '[]'::jsonb,
  equipment jsonb NOT NULL DEFAULT '[]'::jsonb,
  speakers jsonb NOT NULL DEFAULT '[]'::jsonb,
  schedule jsonb NOT NULL DEFAULT '[]'::jsonb,

  has_in_person_speakers boolean NOT NULL DEFAULT false,
  recording boolean NOT NULL DEFAULT false,
  microphone_type text,
  led_color text,
  registration_required boolean NOT NULL DEFAULT false,
  registration_url text,
  notes text,

  admin_notes text,
  reviewed_at timestamptz,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.reservations TO authenticated;
GRANT ALL ON public.reservations TO service_role;

ALTER TABLE public.reservations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users read own reservations"
  ON public.reservations FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role)
         OR (kind = 'internal' AND public.has_role(auth.uid(), 'internal'::public.app_role)));

CREATE POLICY "Users insert own reservations"
  ON public.reservations FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users update own reservations"
  ON public.reservations FOR UPDATE TO authenticated
  USING (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role))
  WITH CHECK (owner_id = auth.uid() OR public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE POLICY "Admins delete reservations"
  ON public.reservations FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::public.app_role));

CREATE TRIGGER reservations_set_updated_at
  BEFORE UPDATE ON public.reservations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE INDEX reservations_owner_idx ON public.reservations(owner_id);
CREATE INDEX reservations_date_room_idx ON public.reservations(date, room);
