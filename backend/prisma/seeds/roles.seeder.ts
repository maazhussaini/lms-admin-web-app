
import { PrismaClient } from '@prisma/client';
import { roles } from '../seed-data/index';
import { upsertMany } from './upsert';

export async function seedRoles(prisma: PrismaClient, bootstrapUserId: number | null) {
  await upsertMany({
    model: prisma.role,
    data: roles.map(role => ({
      ...role,
      created_by: bootstrapUserId ?? null,
      updated_by: bootstrapUserId ?? null,
      deleted_by: bootstrapUserId ?? null,
    })),
    uniqueKey: 'role_type',
  });
  console.log('Seeded roles');
}
