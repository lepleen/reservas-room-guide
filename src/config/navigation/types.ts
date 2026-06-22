import type { LucideIcon } from "lucide-react";
import type { AppRoute } from "@/config/routes";

export type NavRole = "admin" | "internal" | "external";

export type NavItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: AppRoute;
};

export type RoleNavigation = {
  panelLabel: string;
  items: NavItem[];
};

export type ActionItem = {
  id: string;
  label: string;
  icon: LucideIcon;
  to: AppRoute;
};

export type RoleActions = {
  primary?: ActionItem;
};

// Forward-compatible umbrella type. Not consumed by AppShell today, but lets
// each role grow with permissions / feature flags / dashboard config without
// another refactor.
export type RoleConfig = {
  navigation: RoleNavigation;
  actions: RoleActions;
  // permissions?: string[];
  // featureFlags?: Record<string, boolean>;
  // dashboard?: { defaultView?: string };
  // layout?: { sidebar?: "expanded" | "collapsed" };
};
