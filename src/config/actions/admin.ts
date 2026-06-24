import { ShieldCheck } from "lucide-react";
import { ROUTES } from "@/config/routes";
import type { RoleActions } from "@/config/navigation/types";

export const adminActions: RoleActions = {
  primary: {
    type: "route",
    id: "admin.review",
    label: "Review",
    icon: ShieldCheck,
    to: ROUTES.admin,
  },
};
