import { PrismaClient } from '@prisma/client';
import assignments from '../seed-data/assignments';
import { ensureNumber } from './utils/ensureNumber';

export async function seedAssignments(
  prisma: PrismaClient,
  tenantIds: number[],
  courseIds: number[],
  teacherIds: number[],
  usernameToId: Record<string, number>,
  bootstrapUserId: number
): Promise<number[]> {
  const assignmentIds: number[] = [];
  for (const item of assignments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for assignments entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for assignments entry: ${JSON.stringify(item)}`
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
    const assignment = await prisma.assignment.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        teacher_id: mappedTeacherId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    assignmentIds.push(assignment.assignment_id);
  }
  console.log('Seeded assignments');
  return assignmentIds;
}
