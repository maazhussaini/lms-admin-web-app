import { PrismaClient } from '@prisma/client';
import { client_tenants } from '../seed-data/client_tenants';

/**
 * Seeds client_tenants table with mapped client_id and tenant_id by array index.
 * @param prisma PrismaClient instance
 * @param clientIds Array of client IDs in DB order
 * @param tenantIds Array of tenant IDs in DB order
 * @param bootstrapUserId System user ID for audit fields
 */
export async function seedClientTenants(
  prisma: PrismaClient,
  clientIds: number[],
  tenantIds: number[],
  bootstrapUserId: number
) {
  for (const item of client_tenants) {
    // Map by index: assumes client_id and tenant_id in seed data are 1-based and match the order of insertion
    const mappedClientId = clientIds[(item.client_id ?? 1) - 1];
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    if (typeof mappedClientId !== 'number' || isNaN(mappedClientId)) {
      throw new Error(`Invalid mappedClientId for client_tenants entry: ${JSON.stringify(item)}`);
    }
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for client_tenants entry: ${JSON.stringify(item)}`);
    }
    await prisma.clientTenant.create({
      data: {
        ...item,
        client_id: mappedClientId,
        tenant_id: mappedTenantId,
        created_by: bootstrapUserId,
        updated_by: bootstrapUserId,
        deleted_by: bootstrapUserId,
      },
    });
  }
  console.log('Seeded client_tenants');
}
