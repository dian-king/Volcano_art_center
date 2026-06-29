import type { DefaultSession } from "next-auth"

export type UserRole =
  | "GUEST"
  | "REGISTERED_CLIENT"
  | "TALENT_APPLICANT"
  | "TOUR_OPERATOR"
  | "CONTENT_MANAGER"
  | "OPS_MANAGER"
  | "SUPER_ADMIN"

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string
      role: UserRole
    }
  }
}

export interface CartItem {
  productId: string
  quantity: number
}

export interface CartItemWithProduct extends CartItem {
  product: {
    id: string
    name: string
    slug: string
    artistName: string | null
    price: string
    primaryImageUrl: string | null
    status: string
    stockQuantity: number
  }
}

export interface Toast {
  id: string
  message: string
  type: "success" | "error" | "info" | "warning"
}

export interface PlatformSetting {
  category: string
  key: string
  value: string
}
