import { PrismaClient } from '@prisma/client';
import { system_users } from '../seed-data/system_users';
import { ensureNumber, mapAuditFields } from './helpers';

export async function seedSystemUsers(prisma: PrismaClient, tenantIds: number[], bootstrapUserId: number) {
  for (const item of system_users) {
    // Skip bootstrap user (already seeded)
    if (item.username === 'bootstrap_admin') continue;
    let mappedTenantId: number | null = null;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      mappedTenantId = tenantIds[item.tenant_id - 1] ?? null;
    }
    // First pass: audit fields as null
    await prisma.systemUser.upsert({
      where: { username: item.username },
      update: {},
      create: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: null,
        updated_by: null,
        deleted_by: null,
      },
    });
  }
  console.log('Seeded system users');
}
