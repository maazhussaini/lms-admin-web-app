import { PrismaClient } from '@prisma/client';
import { enrollment_status_histories } from '../seed-data/enrollment_status_histories';
import { ensureNumber } from './utils/ensureNumber';

export async function seedEnrollmentStatusHistories(
  prisma: PrismaClient,
  tenantIds: number[],
  enrollmentIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<void> {
  for (const item of enrollment_status_histories) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for enrollment_status_histories entry: ${JSON.stringify(item)}`
    );
    const mappedEnrollmentId = ensureNumber(
      typeof item.enrollment_id === 'number' && enrollmentIds[item.enrollment_id - 1] !== undefined ? enrollmentIds[item.enrollment_id - 1] : enrollmentIds[0],
      `Invalid mappedEnrollmentId for enrollment_status_histories entry: ${JSON.stringify(item)}`
    );
    let mappedChangedBy: number = (item.changed_by != null && auditMaps.usernameToId[item.changed_by] !== undefined && auditMaps.usernameToId[item.changed_by] != null)
      ? auditMaps.usernameToId[item.changed_by]!
      : bootstrapUserId;
    let mappedCreatedBy: number = (item.created_by != null && auditMaps.usernameToId[item.created_by] !== undefined && auditMaps.usernameToId[item.created_by] != null)
      ? auditMaps.usernameToId[item.created_by]!
      : bootstrapUserId;
    let mappedUpdatedBy: number | null = (item.updated_by != null && auditMaps.usernameToId[item.updated_by] !== undefined && auditMaps.usernameToId[item.updated_by] != null)
      ? auditMaps.usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUserId : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && auditMaps.usernameToId[item.deleted_by] !== undefined && auditMaps.usernameToId[item.deleted_by] != null)
      ? auditMaps.usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUserId : null);
    await prisma.enrollmentStatusHistory.create({
      data: {
        tenant_id: mappedTenantId,
        enrollment_id: mappedEnrollmentId,
        previous_status: item.previous_status,
        new_status: item.new_status,
        status_changed_at: item.status_changed_at,
        changed_by: mappedChangedBy,
        change_reason: item.change_reason,
        notes: item.notes,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded enrollment status histories');
}
