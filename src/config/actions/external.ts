import { Plus } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleActions } from "@/config/navigation/types";

export const externalActions: RoleActions = {
  primary: { id: "external.new-request", label: "New", icon: Plus, to: ROUTES.newReservation },
};
