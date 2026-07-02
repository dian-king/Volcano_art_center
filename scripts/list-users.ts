import { db } from "../lib/db"

async function main() {
  const users = await db.user.findMany({ select: { email: true, role: true, isActive: true } })
  console.log(JSON.stringify(users, null, 2))
  await db.$disconnect()
}

main()
