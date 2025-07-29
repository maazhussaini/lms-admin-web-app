import { PrismaClient } from '@prisma/client';
import { student_email_addresses } from '../seed-data/student_email_addresses';

export async function seedStudentEmailAddresses(
  prisma: PrismaClient,
  tenantIds: number[],
  studentIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  bootstrapUserId: number
): Promise<void> {
  for (const item of student_email_addresses) {
    const mappedTenantId =
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined
        ? tenantIds[item.tenant_id - 1]
        : tenantIds[0];
    const mappedStudentId =
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined
        ? studentIds[item.student_id - 1]
        : studentIds[0];
    let mappedCreatedBy = bootstrapUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = typeof id === 'number' ? id : bootstrapUserId;
      }
    }
    let mappedUpdatedBy: number | null = null;
    if (item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = typeof id === 'number' ? id : null;
      }
    }
    let mappedDeletedBy: number | null = null;
    if (item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = typeof id === 'number' ? id : null;
      }
    }
    await prisma.studentEmailAddress.create({
      data: {
        tenant_id: mappedTenantId!,
        student_id: mappedStudentId!,
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
  console.log('Seeded student email addresses');
}
