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
};

type User = { email: string; name: string };

type Ctx = {
  user: User | null;
  login: (email: string, name?: string) => void;
  logout: () => void;
  reservations: Reservation[];
  addReservation: (r: Omit<Reservation, "id" | "createdAt" | "ownerEmail">) => Reservation;
  getReservation: (id: string) => Reservation | undefined;
};

const StoreContext = createContext<Ctx | null>(null);

const USER_KEY = "roomr.user";
const RES_KEY = "roomr.reservations";

function seed(email: string): Reservation[] {
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
    },
    {
      id: "seed-2",
      ownerEmail: email,
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
    },
  ];
}

export function StoreProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [reservations, setReservations] = useState<Reservation[]>([]);

  useEffect(() => {
    try {
      const u = localStorage.getItem(USER_KEY);
      if (u) setUser(JSON.parse(u));
      const r = localStorage.getItem(RES_KEY);
      if (r) setReservations(JSON.parse(r));
    } catch {}
  }, []);

  const persist = (next: Reservation[]) => {
    setReservations(next);
    localStorage.setItem(RES_KEY, JSON.stringify(next));
  };

  const login = useCallback(
    (email: string, name?: string) => {
      const u = { email, name: name ?? email.split("@")[0] };
      setUser(u);
      localStorage.setItem(USER_KEY, JSON.stringify(u));
      if (reservations.length === 0) {
        const s = seed(email);
        persist(s);
      }
    },
    [reservations.length],
  );

  const logout = useCallback(() => {
    setUser(null);
    localStorage.removeItem(USER_KEY);
  }, []);

  const addReservation: Ctx["addReservation"] = (r) => {
    const full: Reservation = {
      ...r,
      id: crypto.randomUUID(),
      ownerEmail: user?.email ?? "guest@local",
      createdAt: new Date().toISOString(),
    };
    persist([full, ...reservations]);
    return full;
  };

  const value = useMemo<Ctx>(
    () => ({
      user,
      login,
      logout,
      reservations,
      addReservation,
      getReservation: (id) => reservations.find((r) => r.id === id),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [user, reservations],
  );

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
}

export function useStore() {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error("useStore must be used within StoreProvider");
  return ctx;
}