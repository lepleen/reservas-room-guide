import { Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleActions } from "@/config/navigation/types";

export const internalActions: RoleActions = {
  primary: {
    type: "route",
    id: "internal.new-request",
    label: "New",
    icon: Plus,
    to: ROUTES.newInternalReservation,
  },
};
