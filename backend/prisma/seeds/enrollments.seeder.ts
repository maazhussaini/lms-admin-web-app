import { PrismaClient } from '@prisma/client';
import { enrollments } from '../seed-data/enrollments';
import { ensureNumber } from './utils/ensureNumber';

export async function seedEnrollments(
  prisma: PrismaClient,
  tenantIds: number[],
  courseIds: number[],
  studentIds: number[],
  instituteIds: number[],
  teacherIds: number[],
  specializationProgramIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<number[]> {
  const enrollmentIds: number[] = [];
  for (const item of enrollments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedInstituteId = ensureNumber(
      typeof item.institute_id === 'number' && instituteIds[item.institute_id - 1] !== undefined ? instituteIds[item.institute_id - 1] : instituteIds[0],
      `Invalid mappedInstituteId for enrollments entry: ${JSON.stringify(item)}`
    );
    let mappedTeacherId: number | null = (typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined && teacherIds[item.teacher_id - 1] != null)
      ? teacherIds[item.teacher_id - 1]!
      : null;
    let mappedStatusChangedBy: number | null = (item.status_changed_by != null && auditMaps.usernameToId[item.status_changed_by] !== undefined && auditMaps.usernameToId[item.status_changed_by] != null)
      ? auditMaps.usernameToId[item.status_changed_by]!
      : (item.status_changed_by != null ? bootstrapUserId : null);
    let mappedCreatedBy: number = (item.created_by != null && auditMaps.usernameToId[item.created_by] !== undefined && auditMaps.usernameToId[item.created_by] != null)
      ? auditMaps.usernameToId[item.created_by]!
      : bootstrapUserId;
    let mappedUpdatedBy: number | null = (item.updated_by != null && auditMaps.usernameToId[item.updated_by] !== undefined && auditMaps.usernameToId[item.updated_by] != null)
      ? auditMaps.usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUserId : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && auditMaps.usernameToId[item.deleted_by] !== undefined && auditMaps.usernameToId[item.deleted_by] != null)
      ? auditMaps.usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUserId : null);
    // Map specialization_program_id using direct 1-based index
    const mappedSpecializationProgramId = specializationProgramIds[item.specialization_program_id - 1];
    if (!mappedSpecializationProgramId) {
      throw new Error(`Invalid specialization_program_id mapping for enrollment: ${JSON.stringify(item)}`);
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        student_id: mappedStudentId,
        institute_id: mappedInstituteId,
        teacher_id: mappedTeacherId,
        specialization_program_id: mappedSpecializationProgramId,
        course_enrollment_type: item.course_enrollment_type,
        enrollment_status: item.enrollment_status,
        enrolled_at: item.enrolled_at,
        expected_completion_date: item.expected_completion_date,
        actual_completion_date: item.actual_completion_date,
        status_changed_at: item.status_changed_at,
        status_changed_by: mappedStatusChangedBy,
        status_change_reason: item.status_change_reason,
        grade: item.grade,
        final_score: item.final_score,
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
    enrollmentIds.push(enrollment.enrollment_id);
  }
  console.log('Seeded enrollments');
  return enrollmentIds;
}
