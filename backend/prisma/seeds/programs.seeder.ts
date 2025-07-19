import { PrismaClient } from '@prisma/client';
import { programs } from '../seed-data/programs';

/**
 * Seeds the programs table and returns created program IDs.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)
 * @param auditMaps Audit maps for user index to system_user_id
 * @param fallbackUserId System user ID for fallback audit fields
 * @returns Array of created program IDs
 */
export async function seedPrograms(
  prisma: PrismaClient,
  tenantIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  fallbackUserId: number
): Promise<number[]> {
  const programIds: number[] = [];
  for (const item of programs) {
    // Map tenant_id by array index
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for programs entry: ${JSON.stringify(item)}`);
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
    const program = await prisma.program.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    programIds.push(program.program_id);
  }
  console.log('Seeded programs');
  return programIds;
}
