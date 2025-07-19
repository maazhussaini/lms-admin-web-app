import { PrismaClient } from '@prisma/client';
import { tenants } from '../seed-data/tenants';
import { upsertMany } from './upsert';

export async function seedTenants(prisma: PrismaClient, auditUserId: number) {
  await upsertMany({
    model: prisma.tenant,
    data: tenants,
    uniqueKey: 'tenant_name',
    extraFields: {
      created_by: auditUserId,
      updated_by: auditUserId,
      deleted_by: auditUserId,
    },
  });
  console.log('Seeded tenants');
}
