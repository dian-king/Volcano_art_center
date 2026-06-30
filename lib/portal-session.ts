import { cache } from "react"
import { auth } from "@/lib/auth"
import { db } from "@/lib/db"

export const getPortalSession = cache(async () => auth())

export const getTourOperatorByUserId = cache(async (userId: string) => {
  return db.tourOperator.findUnique({ where: { userId } })
})
