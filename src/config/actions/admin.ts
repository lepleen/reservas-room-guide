import { Plus } from "lucide-react";
import type { RoleActions } from "@/config/navigation/types";

export const adminActions: RoleActions = {
  primary: {
    type: "custom",
    id: "admin.new-request",
    label: "New Request",
    icon: Plus,
    actionId: "admin.new-request",
  },
};
