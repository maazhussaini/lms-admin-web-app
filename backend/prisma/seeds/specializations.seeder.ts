import { PrismaClient } from '@prisma/client';
import { specializations } from '../seed-data/specializations';

/**
 * Seeds the specializations table and returns created specialization IDs.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)
 * @param programIds Array of program IDs (ordered)
 * @param auditMaps Audit maps for user index to system_user_id
 * @param fallbackUserId System user ID for fallback audit fields
 * @returns Array of created specialization IDs
 */
export async function seedSpecializations(
  prisma: PrismaClient,
  tenantIds: number[],
  programIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  fallbackUserId: number
): Promise<number[]> {
  const specializationIds: number[] = [];
  for (const item of specializations) {
    // Map tenant_id and program_id by array index
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    const mappedProgramId = programIds[(item.program_id ?? 1) - 1];
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for specializations entry: ${JSON.stringify(item)}`);
    }
    if (typeof mappedProgramId !== 'number' || isNaN(mappedProgramId)) {
      throw new Error(`Invalid mappedProgramId for specializations entry: ${JSON.stringify(item)}`);
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
    // NOTE: program_id is omitted due to Prisma model constraints. If needed, update schema and add here.
    // NOTE: program_id is omitted due to Prisma model constraints. If needed, update schema and add here.
    const { program_id, ...rest } = item;
    const specialization = await prisma.specialization.create({
      data: {
        ...rest,
        tenant_id: mappedTenantId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    specializationIds.push(specialization.specialization_id);
  }
  console.log('Seeded specializations');
  return specializationIds;
}
