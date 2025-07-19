import { PrismaClient } from '@prisma/client';
import { teacher_email_addresses } from '../seed-data/teacher_email_addresses';
import { ensureNumber } from './utils/ensureNumber.js';

/**
 * Modular seeder for teacher_email_addresses table
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs
 * @param teacherIds Array of teacher IDs
 * @param auditMaps Audit mapping helpers
 * @param bootstrapUserId Fallback system user ID
 */
export async function seedTeacherEmailAddresses(
  prisma: PrismaClient,
  tenantIds: number[],
  teacherIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<void> {
  for (const item of teacher_email_addresses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for teacher_email_addresses entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for teacher_email_addresses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUserId;
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
    await prisma.teacherEmailAddress.create({
      data: {
        tenant_id: mappedTenantId,
        teacher_id: mappedTeacherId,
        email_address: item.email_address,
        is_primary: item.is_primary,
        priority: item.priority,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
        created_ip: item.created_ip,
        updated_ip: item.updated_ip,
      },
    });
  }
  console.log('Seeded teacher email addresses');
}
