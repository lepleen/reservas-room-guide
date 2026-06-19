import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { checkAvailability, type AvailabilityResult } from "./availability.functions";

type Args = {
  room: string | undefined;
  date: string;
  startTime: string;
  endTime: string;
  excludeId?: string;
};

const TIME_RE = /^\d{2}:\d{2}$/;
const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

export function useAvailability(args: Args) {
  const fn = useServerFn(checkAvailability);

  // Debounce: only fire after inputs settle for 300ms.
  const [debounced, setDebounced] = useState(args);
  useEffect(() => {
    const t = setTimeout(() => setDebounced(args), 300);
    return () => clearTimeout(t);
  }, [args.room, args.date, args.startTime, args.endTime, args.excludeId]);

  const enabled =
    Boolean(debounced.room) &&
    DATE_RE.test(debounced.date) &&
    TIME_RE.test(debounced.startTime) &&
    TIME_RE.test(debounced.endTime) &&
    debounced.startTime < debounced.endTime &&
    import.meta.env.VITE_AUTH_BYPASS !== "true";

  return useQuery<AvailabilityResult>({
    queryKey: [
      "availability",
      debounced.room,
      debounced.date,
      debounced.startTime,
      debounced.endTime,
      debounced.excludeId ?? null,
    ],
    enabled,
    staleTime: 15_000,
    queryFn: () =>
      fn({
        data: {
          room: debounced.room!,
          date: debounced.date,
          startTime: debounced.startTime,
          endTime: debounced.endTime,
          excludeId: debounced.excludeId,
        },
      }),
  });
}
