import { adminNavigation } from "./admin";
import { internalNavigation } from "./internal";
import { externalNavigation } from "./external";
import type { NavRole, RoleNavigation } from "./types";

export const navigationByRole: Record<NavRole, RoleNavigation> = {
  admin: adminNavigation,
  internal: internalNavigation,
  external: externalNavigation,
};

export type { NavRole, NavItem, RoleNavigation } from "./types";
