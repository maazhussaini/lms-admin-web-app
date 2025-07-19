import { PrismaClient } from '@prisma/client';
import { student_course_progresses } from '../seed-data/student_course_progresses';
import { ensureNumber } from './utils/ensureNumber';

export async function seedStudentCourseProgresses(
  prisma: PrismaClient,
  tenantIds: number[],
  studentIds: number[],
  courseIds: number[],
  auditMaps: any,
  bootstrapUserId: number
) {
  const { usernameToId } = auditMaps;
  for (const item of student_course_progresses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_course_progresses entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_course_progresses entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for student_course_progresses entry: ${JSON.stringify(item)}`
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
    await prisma.studentCourseProgress.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        course_id: mappedCourseId,
        overall_progress_percentage: item.overall_progress_percentage,
        modules_completed: item.modules_completed,
        videos_completed: item.videos_completed,
        quizzes_completed: item.quizzes_completed,
        assignments_completed: item.assignments_completed,
        total_time_spent_minutes: item.total_time_spent_minutes,
        last_accessed_at: item.last_accessed_at,
        is_course_completed: item.is_course_completed,
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
  console.log('Seeded student course progresses.');
}
