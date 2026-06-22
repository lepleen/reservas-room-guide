import { useNavigate } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useQueryClient } from "@tanstack/react-query";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useCallback, useMemo, useState } from "react";
import {
  Building2,
  CalendarClock,
  ClipboardList,
  Coffee,
  ListChecks,
  Mic,
  Settings2,
  Sparkles,
  User,
  Users,
} from "lucide-react";
import { toast } from "sonner";

import {
  userReservationSchema,
  defaultUserReservationValues,
  type UserReservationValues,
} from "./schema";
import { createUserReservation } from "./submit.functions";
import { useAvailability } from "@/features/shared/useAvailability";
import { RequestAvailabilityDialog } from "@/components/RequestAvailabilityDialog";
import { isRoomUnavailable } from "@/features/shared/conflict-error";
import type {
  AvailabilityRequest,
  AvailabilityRequestDraft,
} from "@/features/shared/availability-request";

import { Wizard, type WizardStepDef } from "@/components/forms/wizard";
import { ReservationFormContext } from "@/features/reservations/reservation-form-context";
import { getRoomForSetupOption } from "@/features/reservations/room-selection";
import {
  AVStep,
  CateringStep,
  EquipmentStep,
  EventBasicsStep,
  OrganizerStep,
  RegistrationStep,
  RoomStep,
  ScheduleStep,
  SetupStyleStep,
  SpeakersStep,
} from "@/features/reservations/steps";

export function UserReservationForm() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const submitFn = useServerFn(createUserReservation);

  const form = useForm<UserReservationValues>({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(userReservationSchema) as any,
    defaultValues: defaultUserReservationValues as UserReservationValues,
    mode: "onBlur",
  });

  const v = form.watch();
  const room = useMemo(() => getRoomForSetupOption(v.setupOptionId), [v.setupOptionId]);

  const authBypass = import.meta.env.VITE_AUTH_BYPASS === "true";

  const availability = useAvailability({
    room,
    date: v.date,
    startTime: v.startTime,
    endTime: v.endTime,
  });
  const availabilityEnabled =
    !authBypass && Boolean(room) && Boolean(v.date) && v.startTime < v.endTime;
  const hasConflict = (availability.data?.conflicts.length ?? 0) > 0;

  const [conflictOpen, setConflictOpen] = useState(false);
  const [pendingAvailabilityRequest, setPendingAvailabilityRequest] =
    useState<AvailabilityRequest | null>(null);
  void pendingAvailabilityRequest;

  const draft: AvailabilityRequestDraft | null = useMemo(() => {
    if (!room || !v.setupOptionId || !v.date || !v.startTime || !v.endTime) {
      return null;
    }
    return {
      requesterName: v.organizerName || undefined,
      reservationType: "external",
      roomId: v.setupOptionId,
      roomName: room,
      reservationDate: v.date,
      startTime: v.startTime,
      endTime: v.endTime,
    };
  }, [room, v.setupOptionId, v.date, v.startTime, v.endTime, v.organizerName]);

  const onSubmit = useCallback(async () => {
    const values = form.getValues();
    const valid = await form.trigger();
    if (!valid) return;
    try {
      if (authBypass) {
        toast.success("Reservation captured (auth bypass — not persisted)");
        navigate({ to: "/dashboard" });
        return;
      }
      if (hasConflict) {
        setConflictOpen(true);
        return;
      }
      const res = await submitFn({ data: { values } });
      await queryClient.invalidateQueries({ queryKey: ["reservations"] });
      toast.success("Reservation submitted for review");
      navigate({ to: "/reservations/$id", params: { id: res.id } });
    } catch (err) {
      if (isRoomUnavailable(err)) {
        availability.refetch();
        setConflictOpen(true);
        return;
      }
      const msg = err instanceof Error ? err.message : "Failed to submit reservation";
      toast.error(msg);
    }
  }, [form, authBypass, hasConflict, submitFn, queryClient, navigate, availability]);

  const onCancel = useCallback(() => navigate({ to: "/dashboard" }), [navigate]);

  const steps = useMemo<WizardStepDef<UserReservationValues>[]>(
    () => [
      {
        id: "event-basics",
        title: "Event basics",
        description: "Essentials about the event.",
        icon: Sparkles,
        component: EventBasicsStep,
        validationFields: ["eventName", "attendees", "eventType", "broadcastPlatform"],
      },
      {
        id: "room",
        title: "Room",
        description: "Pick the room, date, and time window.",
        icon: Building2,
        component: RoomStep,
        validationFields: ["setupOptionId", "date", "startTime", "endTime"],
      },
      {
        id: "catering",
        title: "Catering",
        description: "Optional food & drink.",
        icon: Coffee,
        component: CateringStep,
        validationFields: ["catering", "cateringItems"],
        isOptional: true,
      },
      {
        id: "speakers",
        title: "Speakers",
        description: "In-person presenters.",
        icon: Users,
        component: SpeakersStep,
        validationFields: ["hasInPersonSpeakers", "speakers"],
        isOptional: true,
      },
      {
        id: "av",
        title: "AV",
        description: "Microphone & recording.",
        icon: Mic,
        component: AVStep,
        validationFields: ["recording", "microphoneType"],
      },
      {
        id: "equipment",
        title: "Equipment",
        description: "Optional add-ons.",
        icon: ListChecks,
        component: EquipmentStep,
        validationFields: ["equipment"],
        isOptional: true,
      },
      {
        id: "registration",
        title: "Registration",
        description: "Track attendee sign-ups.",
        icon: ClipboardList,
        component: RegistrationStep,
        validationFields: ["registrationRequired", "registrationUrl"],
      },
      {
        id: "schedule",
        title: "Schedule",
        description: "Plan the run-of-show and add notes.",
        icon: CalendarClock,
        component: ScheduleStep,
        validationFields: ["schedule", "notes"],
        isOptional: true,
      },
      {
        id: "setup-style",
        title: "Setup style",
        description: "Choose the layout for the selected room.",
        icon: Settings2,
        component: SetupStyleStep,
        validationFields: ["setupOptionId", "attendees"],
      },
      {
        id: "organizer",
        title: "Organizer",
        description: "Who is responsible for this event.",
        icon: User,
        component: OrganizerStep,
        validationFields: ["organizerName", "jobTitle", "phone", "brand", "cnpj"],
      },
    ],
    [],
  );

  const ctx = useMemo(
    () => ({
      availability,
      hasConflict,
      availabilityEnabled,
      onRequestAvailability: () => setConflictOpen(true),
    }),
    [availability, hasConflict, availabilityEnabled],
  );

  return (
    <FormProvider {...form}>
      <ReservationFormContext.Provider value={ctx}>
        <Wizard
          steps={steps}
          onSubmit={onSubmit}
          onCancel={onCancel}
          submitDisabled={
            form.formState.isSubmitting || hasConflict || availability.isFetching
          }
          submitLabel="Submit reservation"
        />
      </ReservationFormContext.Provider>
      <RequestAvailabilityDialog
        open={conflictOpen}
        onOpenChange={setConflictOpen}
        draft={draft}
        onNotifyRequested={setPendingAvailabilityRequest}
      />
    </FormProvider>
  );
}
