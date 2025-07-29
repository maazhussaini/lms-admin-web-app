import { PrismaClient } from '@prisma/client';
import { system_users } from '../seed-data/system_users';
/**
 * Password Hashing Note:
 * ----------------------
 * The system user seeder now hashes the plain password from seed-data/system_users.ts using the project's hashPassword utility.
 * This ensures all seeded system users have secure, production-grade password hashes.
 * Do NOT include pre-hashed passwords in the seed data; always use a plain password field.
 * The hashPassword function uses bcrypt with 12 salt rounds (OWASP recommended).
 * The CLI utility (npm run hash-password) uses the same logic for manual password generation.
 */
import { hashPassword } from '../../src/utils/password.utils';

export async function seedSystemUsers(prisma: PrismaClient, tenantIds: number[]) {
  for (const item of system_users) {
    // Skip bootstrap user (already seeded)
    if (item.username === 'bootstrap_admin') continue;
    let mappedTenantId: number | null = null;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      mappedTenantId = tenantIds[item.tenant_id - 1] ?? null;
    }
    // First pass: audit fields as null
    // Hash the plain password before inserting
    const passwordHash = await hashPassword(item.password);
    const { password, ...rest } = item;
    await prisma.systemUser.upsert({
      where: { username: item.username },
      update: {},
      create: {
        ...rest,
        password_hash: passwordHash,
        tenant_id: mappedTenantId,
        created_by: null,
        updated_by: null,
        deleted_by: null,
      },
    });
  }
  console.log('Seeded system users');
}
