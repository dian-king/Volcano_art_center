import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatPrice(amount: number | string | { toNumber: () => number }): string {
  const num = typeof amount === "object" && "toNumber" in amount ? amount.toNumber() : Number(amount)
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(num)
}

export function formatDate(date: Date | string): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric", month: "long", day: "numeric",
  }).format(new Date(date))
}
