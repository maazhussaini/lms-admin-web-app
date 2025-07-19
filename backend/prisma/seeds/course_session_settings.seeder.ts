import { PrismaClient } from '@prisma/client';
import { course_session_settings } from '../seed-data/course_session_settings';
import { ensureNumber } from './utils/ensureNumber';

export async function seedCourseSessionSettings(
  prisma: PrismaClient,
  tenantIds: number[],
  courseSessionIds: number[],
  auditMaps: any,
  bootstrapUserId: number
) {
  const { usernameToId } = auditMaps;
  for (const item of course_session_settings) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_session_settings entry: ${JSON.stringify(item)}`
    );
    const mappedCourseSessionId = ensureNumber(
      typeof item.course_session_id === 'number' && courseSessionIds[item.course_session_id - 1] !== undefined ? courseSessionIds[item.course_session_id - 1] : courseSessionIds[0],
      `Invalid mappedCourseSessionId for course_session_settings entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUserId;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUserId : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUserId : null);
    await prisma.courseSessionSettings.create({
      data: {
        tenant_id: mappedTenantId,
        course_session_id: mappedCourseSessionId,
        allow_late_enrollment: item.allow_late_enrollment,
        require_approval_for_enrollment: item.require_approval_for_enrollment,
        allow_student_discussions: item.allow_student_discussions,
        send_reminder_emails: item.send_reminder_emails,
        reminder_days_before_expiry: item.reminder_days_before_expiry,
        grading_scale: item.grading_scale,
        attendance_tracking_enabled: item.attendance_tracking_enabled,
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
  console.log('Seeded course session settings');
}
