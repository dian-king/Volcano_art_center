export const ADMIN_ROLES = ["SUPER_ADMIN", "CONTENT_MANAGER", "OPS_MANAGER"] as const
export const CONTENT_ROLES = ["CONTENT_MANAGER", "SUPER_ADMIN"] as const
export const OPS_ROLES = ["OPS_MANAGER", "SUPER_ADMIN"] as const
export const SUPER_ROLES = ["SUPER_ADMIN"] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

export function hasRole(role: string | null | undefined, allowed: readonly string[]) {
  return Boolean(role && allowed.includes(role))
}

export function requireRole(role: string | null | undefined, allowed: readonly string[]) {
  if (!hasRole(role, allowed)) throw new Error("Unauthorized")
}

/** Where a signed-in user lands after login, based on their role. */
export function dashboardPathForRole(role: string | null | undefined): string {
  if (role && ADMIN_ROLES.includes(role as (typeof ADMIN_ROLES)[number])) return "/admin"
  if (role === "TALENT_APPLICANT") return "/talent/dashboard"
  if (role === "TOUR_OPERATOR") return "/tour-operators/portal"
  if (role === "REGISTERED_CLIENT") return "/client/dashboard/profile"
  return "/"
}

export const ADMIN_ROUTE_ROLES: Record<string, readonly string[]> = {
  "/admin/products": OPS_ROLES,
  "/admin/orders": OPS_ROLES,
  "/admin/bookings": OPS_ROLES,
  "/admin/inquiries": OPS_ROLES,
  "/admin/operators": OPS_ROLES,
  "/admin/applications": OPS_ROLES,
  "/admin/slots": OPS_ROLES,
  "/admin/users": SUPER_ROLES,
  "/admin/settings": SUPER_ROLES,
  "/admin/audit": SUPER_ROLES,
  "/admin/export": SUPER_ROLES,
  "/admin/overrides": SUPER_ROLES,
}
