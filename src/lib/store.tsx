import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

export type Reservation = {
  id: string;
  ownerEmail: string;
  ownerName?: string;
  kind: "user" | "internal";
  eventName: string;
  room: string;
  date: string; // ISO yyyy-mm-dd
  startTime: string;
  endTime: string;
  attendees: number;
  setupStyle: "theater" | "classroom" | "u-shape" | "boardroom" | "banquet";
  catering: boolean;
  cateringNotes?: string;
  speakers: { name: string; topic: string }[];
  hasLiveBroadcast: boolean;
  broadcastPlatform?: string;
  hasInPersonSpeakers: boolean;
  recording: boolean;
  ledColor?: string;
  microphoneType?: "handheld" | "lavalier" | "headset" | "podium";
  registrationRequired: boolean;
  registrationUrl?: string;
  schedule: { time: string; action: string }[];
  notes?: string;
  createdAt: string;
  status: "pending" | "approved" | "rejected";
  adminNotes?: string;
  reviewedAt?: string;
};

type User = { email: string; name: string };
export type Role = "user" | "admin" | "internal";

type Ctx = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  role: Role;
  setRole: (r: Role) => void;
  reservations: Reservation[];
  addReservation: (
    r: Omit<Reservation, "id" | "createdAt" | "ownerEmail" | "status" | "kind">,
    kind?: Reservation["kind"],
  ) => Reservation;
  getReservation: (id: string) => Reservation | undefined;
  decideReservation: (
    id: string,
    decision: "approved" | "rejected",
    notes?: string,
  ) => void;
};

const StoreContext = createContext<Ctx | null>(null);

const USER_KEY = "roomr.user";
const RES_KEY = "roomr.reservations";
const ROLE_KEY = "roomr.role";

function seed(email: string, name?: string): Reservation[] {
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const plus = (n: number) => {
    const d = new Date(today);
    d.setDate(d.getDate() + n);
    return iso(d);
  };
  return [
    {
      id: "seed-1",
      ownerEmail: email,
      ownerName: name,
      kind: "user",
      eventName: "Quarterly Product Review",
      room: "Atlas Hall",
      date: plus(5),
      startTime: "09:00",
      endTime: "12:30",
      attendees: 80,
      setupStyle: "theater",
      catering: true,
      cateringNotes: "Coffee + pastries at 08:30",
      speakers: [{ name: "Maya Chen", topic: "Roadmap" }],
      hasLiveBroadcast: true,
      broadcastPlatform: "Zoom Webinar",
      hasInPersonSpeakers: true,
      recording: true,
      ledColor: "#1978E5",
      microphoneType: "lavalier",
      registrationRequired: true,
      registrationUrl: "https://example.com/r/qpr",
      schedule: [
        { time: "09:00", action: "Doors open" },
        { time: "09:30", action: "Opening remarks" },
        { time: "10:00", action: "Roadmap presentation" },
      ],
      notes: "VIP seating in front two rows.",
      createdAt: new Date().toISOString(),
      status: "pending",
    },
    {
      id: "seed-2",
      ownerEmail: email,
      ownerName: name,
      kind: "user",
      eventName: "Design Critique",
      room: "Studio B",
      date: plus(-7),
      startTime: "14:00",
      endTime: "16:00",
      attendees: 12,
      setupStyle: "boardroom",
      catering: false,
      speakers: [],
      hasLiveBroadcast: false,
      hasInPersonSpeakers: false,
      recording: false,
      registrationRequired: false,
      schedule: [{ time: "14:00", action: "Walk through prototypes" }],
      createdAt: new Date().toISOString(),
      status: "approved",
      adminNotes: "Approved — studio B confirmed.",
      reviewedAt: new Date().toISOString(),
    },
    {
      id: "seed-3",
      ownerEmail: "ops@roomr.app",
      ownerName: "Internal ops",
      kind: "internal",
      eventName: "Internal AV maintenance",
      room: "Studio A",
      date: plus(2),
      startTime: "08:00",
      endTime: "10:00",
      attendees: 4,
      setupStyle: "boardroom",
      catering: false,
      speakers: [],
      hasLiveBroadcast: false,
      hasInPersonSpeakers: false,
      recording: false,
      registrationRequired: false,
      schedule: [{ time: "08:00", action: "AV system check" }],
      createdAt: new Date().toISOString(),
      status: "pending",
    },
  ];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [role, setRoleState] = useState<Role>("user");

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
      const r = localStorage.getItem(RES_KEY);
      if (r) {
        setReservations(JSON.parse(r));
      } else {
        const s = seed("demo@roomr.app", "Demo user");
        setReservations(s);
        localStorage.setItem(RES_KEY, JSON.stringify(s));
      }
      const ro = localStorage.getItem(ROLE_KEY);
      if (ro === "admin" || ro === "user") setRoleState(ro);
    } catch {}
  }, []);

  const persist = (next: Reservation[]) => {
    setReservations(next);
    localStorage.setItem(RES_KEY, JSON.stringify(next));
  };

  const setRole = useCallback((r: Role) => {
    setRoleState(r);
    localStorage.setItem(ROLE_KEY, r);
  }, []);

  const login = useCallback(
    (email: string, name?: string) => {
      const u = { email, name: name ?? email.split("@")[0] };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const addReservation: Ctx["addReservation"] = (r, kind = "user") => {
    const full: Reservation = {
      ...r,
      id: crypto.randomUUID(),
      ownerEmail: user?.email ?? "guest@local",
      ownerName: user?.name,
      kind,
      createdAt: new Date().toISOString(),
      status: "pending",
    };
    persist([full, ...reservations]);
    return full;
  };

  const decideReservation: Ctx["decideReservation"] = (id, decision, notes) => {
    const next = reservations.map((r) =>
      r.id === id
        ? { ...r, status: decision, adminNotes: notes, reviewedAt: new Date().toISOString() }
        : r,
    );
    persist(next);
  };

  const value = useMemo<Ctx>(
    () => ({
      user,
      login,
      logout,
      role,
      setRole,
      reservations,
      addReservation,
      getReservation: (id) => reservations.find((r) => r.id === id),
      decideReservation,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, reservations, role],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}