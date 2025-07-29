import { PrismaClient } from '@prisma/client';
import { user_screens } from '../seed-data/user_screens';
import { ensureNumber, mapAuditFields } from './helpers';

export async function seedUserScreens(prisma: PrismaClient, tenantIds: number[], allUsers: any[], screenIds: number[], usernameToId: Record<string, number>, bootstrapUserId: number) {
  for (const item of user_screens) {
    // Map tenant_id, system_user_id, screen_id by array index (1-based in seed data)
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for user_screens entry: ${JSON.stringify(item)}`
    );
    const mappedSystemUserId = ensureNumber(
      (() => {
        let userObj = (typeof item.system_user_id === 'number') ? allUsers[item.system_user_id - 1] : undefined;
        return (userObj && typeof userObj.system_user_id === 'number')
          ? userObj.system_user_id
          : (allUsers[0]?.system_user_id ?? 1);
      })(),
      `Invalid mappedSystemUserId for user_screens entry: ${JSON.stringify(item)}`
    );
    const mappedScreenId = ensureNumber(
      typeof item.screen_id === 'number' && screenIds[item.screen_id - 1] !== undefined ? screenIds[item.screen_id - 1] : screenIds[0],
      `Invalid mappedScreenId for user_screens entry: ${JSON.stringify(item)}`
    );
    // Map audit fields
    const auditFields = mapAuditFields(item, usernameToId, bootstrapUserId);
    await prisma.userScreen.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        system_user_id: mappedSystemUserId,
        screen_id: mappedScreenId,
        created_by: auditFields.created_by ?? bootstrapUserId,
        updated_by: auditFields.updated_by ?? null,
        deleted_by: auditFields.deleted_by ?? null,
      },
    });
  }
  console.log('Seeded user screens');
}
