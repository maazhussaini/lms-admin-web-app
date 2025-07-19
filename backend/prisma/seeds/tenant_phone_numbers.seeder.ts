import { PrismaClient } from '@prisma/client';
import { tenant_phone_numbers } from '../seed-data/tenant_phone_numbers';

/**
 * Seeds the tenant_phone_numbers table, mapping tenant IDs and audit fields.
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs (ordered)
 * @param usernameToId Map of usernames to system_user_ids
 * @param auditUserId System user ID for fallback audit fields
 */
export async function seedTenantPhoneNumbers(
  prisma: PrismaClient,
  tenantIds: number[],
  usernameToId: { [key: string]: number },
  auditUserId: number
): Promise<void> {
  for (const item of tenant_phone_numbers) {
    let mappedTenantId: number;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      const possibleTenantId = tenantIds[item.tenant_id - 1];
      if (typeof possibleTenantId !== 'number' || isNaN(possibleTenantId)) {
        throw new Error(`Invalid mappedTenantId for tenant_phone_numbers entry: ${JSON.stringify(item)}`);
      }
      mappedTenantId = possibleTenantId;
    } else {
      throw new Error(`Missing tenant_id for tenant_phone_numbers entry: ${JSON.stringify(item)}`);
    }
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
    await prisma.tenantPhoneNumber.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded tenant phone numbers');
}
