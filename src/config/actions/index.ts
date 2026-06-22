import { adminActions } from "./admin";
import { internalActions } from "./internal";
import { externalActions } from "./external";
import type { NavRole, RoleActions } from "@/config/navigation/types";

export const actionsByRole: Record<NavRole, RoleActions> = {
  admin: adminActions,
  internal: internalActions,
  external: externalActions,
};

export type { RoleActions, ActionItem } from "@/config/navigation/types";
