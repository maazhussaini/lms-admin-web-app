import { PrismaClient } from '@prisma/client';
import { clients } from '../seed-data/clients';

/**
 * Seeds the clients table, mapping tenant IDs and audit fields, and returns created client IDs.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)

/**
 * Seeds the clients table, mapping tenant IDs and audit fields, and returns created client IDs.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)
 * @param auditMaps Audit maps for user index to system_user_id
 * @param fallbackUserId System user ID for fallback audit fields
 * @returns Array of created client IDs
 */
export async function seedClients(
  prisma: PrismaClient,
  tenantIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  fallbackUserId: number
): Promise<number[]> {
  const clientIds: number[] = [];
  for (const item of clients) {
    let mappedTenantId: number;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      const possibleTenantId = tenantIds[item.tenant_id - 1];
      if (typeof possibleTenantId !== 'number' || isNaN(possibleTenantId)) {
        throw new Error(`Invalid mappedTenantId for clients entry: ${JSON.stringify(item)}`);
      }
      mappedTenantId = possibleTenantId;
    } else {
      throw new Error(`Missing tenant_id for clients entry: ${JSON.stringify(item)}`);
    }
    // Map audit fields from seed data using auditMaps
    let mappedCreatedBy = fallbackUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : fallbackUserId;
      }
    }
    let mappedUpdatedBy: number | null = null;
    if (item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = (typeof id === 'number') ? id : null;
      }
    }
    let mappedDeletedBy: number | null = null;
    if (item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = (typeof id === 'number') ? id : null;
      }
    }
    const client = await prisma.client.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    clientIds.push(client.client_id);
  }
  console.log('Seeded clients');
  return clientIds;
}
