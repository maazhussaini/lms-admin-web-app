import { PrismaClient } from '@prisma/client';
import { course_sessions } from '../seed-data/course_sessions';
import { ensureNumber } from './utils/ensureNumber';

export async function seedCourseSessions(
  prisma: PrismaClient,
  tenantIds: number[],
  courseIds: number[],
  teacherIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<number[]> {
  const { usernameToId } = auditMaps;
  const courseSessionIds: number[] = [];
  for (const item of course_sessions) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_sessions entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_sessions entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for course_sessions entry: ${JSON.stringify(item)}`
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
    const courseSession = await prisma.courseSession.create({
      data: {
        tenant_id: mappedTenantId,
        teacher_id: mappedTeacherId,
        course_id: mappedCourseId,
        course_session_status: item.course_session_status,
        session_name: item.session_name,
        session_description: item.session_description,
        start_date: item.start_date,
        end_date: item.end_date,
        max_students: item.max_students,
        enrollment_deadline: item.enrollment_deadline,
        session_timezone: item.session_timezone,
        session_code: item.session_code,
        auto_expire_enabled: item.auto_expire_enabled,
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
    courseSessionIds.push(courseSession.course_session_id);
  }
  console.log('Seeded course sessions');
  return courseSessionIds;
}
