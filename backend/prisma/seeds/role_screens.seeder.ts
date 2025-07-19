import { PrismaClient } from '@prisma/client';
import { role_screens } from '../seed-data/role_screens';

/**
 * Seeds the role_screens table, mapping tenant IDs, screen IDs, and audit fields.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)
 * @param screenIds Array of screen IDs (ordered)
 * @param usernameToId Map of usernames to system_user_ids
 * @param auditUserId System user ID for fallback audit fields
 */
export async function seedRoleScreens(
  prisma: PrismaClient,
  tenantIds: number[],
  screenIds: number[],
  usernameToId: { [key: string]: number },
  auditUserId: number
): Promise<void> {
  for (const item of role_screens) {
    // Map tenant_id, screen_id by array index (1-based in seed data)
    const mappedTenantId = typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined
      ? tenantIds[item.tenant_id - 1]
      : tenantIds[0];
    const mappedScreenId = typeof item.screen_id === 'number' && screenIds[item.screen_id - 1] !== undefined
      ? screenIds[item.screen_id - 1]
      : screenIds[0];
    // Map audit fields
    let mappedCreatedBy = (item.created_by != null && usernameToId[item.created_by] !== undefined)
      ? usernameToId[item.created_by]
      : auditUserId;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined)
      ? usernameToId[item.updated_by]
      : (item.updated_by != null ? auditUserId : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined)
      ? usernameToId[item.deleted_by]
      : (item.deleted_by != null ? auditUserId : null);
    await prisma.roleScreen.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        screen_id: mappedScreenId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded role screens');
}
