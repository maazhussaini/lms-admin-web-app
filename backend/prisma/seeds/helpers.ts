// Generic helpers for seeding

export function ensureNumber(val: any, errorMsg: string): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  throw new Error(errorMsg);
}

export function mapAuditFields(item: any, usernameToId: Record<string, number>, bootstrapUserId: number) {
  return {
    created_by: item.created_by != null && usernameToId[item.created_by] !== undefined ? usernameToId[item.created_by] : bootstrapUserId,
    updated_by: item.updated_by != null && usernameToId[item.updated_by] !== undefined ? usernameToId[item.updated_by] : (item.updated_by != null ? bootstrapUserId : null),
    deleted_by: item.deleted_by != null && usernameToId[item.deleted_by] !== undefined ? usernameToId[item.deleted_by] : (item.deleted_by != null ? bootstrapUserId : null),
  };
}
