import { PrismaClient } from '@prisma/client';
import { course_session_enrollments } from '../seed-data/course_session_enrollments';
import { ensureNumber } from './utils/ensureNumber';

export async function seedCourseSessionEnrollments(
  prisma: PrismaClient,
  tenantIds: number[],
  courseSessionIds: number[],
  studentIds: number[],
  enrollmentIds: number[],
  auditMaps: any,
  bootstrapUserId: number
) {
  const { usernameToId } = auditMaps;
  for (const item of course_session_enrollments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseSessionId = ensureNumber(
      typeof item.course_session_id === 'number' && courseSessionIds[item.course_session_id - 1] !== undefined ? courseSessionIds[item.course_session_id - 1] : courseSessionIds[0],
      `Invalid mappedCourseSessionId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedEnrollmentId = ensureNumber(
      typeof item.enrollment_id === 'number' && enrollmentIds[item.enrollment_id - 1] !== undefined ? enrollmentIds[item.enrollment_id - 1] : enrollmentIds[0],
      `Invalid mappedEnrollmentId for course_session_enrollments entry: ${JSON.stringify(item)}`
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
    await prisma.courseSessionEnrollment.create({
      data: {
        tenant_id: mappedTenantId,
        course_session_id: mappedCourseSessionId,
        student_id: mappedStudentId,
        enrollment_id: mappedEnrollmentId,
        enrolled_at: item.enrolled_at,
        dropped_at: item.dropped_at,
        enrollment_status: item.enrollment_status,
        completion_percentage: item.completion_percentage,
        final_grade: item.final_grade,
        completion_date: item.completion_date,
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
  console.log('Seeded course session enrollments.');
}
