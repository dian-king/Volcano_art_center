import { db } from "./db"

interface AuditParams {
  actorId?: string
  actorEmail?: string
  eventType: string
  entityType: string
  entityId?: string
  details?: string
  before?: object
  after?: object
}

export async function audit(params: AuditParams) {
  await db.auditLog.create({ data: params }).catch(() => {})
}