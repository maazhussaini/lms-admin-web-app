import { PrismaClient } from '@prisma/client';
import studentAssignments from '../seed-data/student_assignments';
import { ensureNumber } from './utils/ensureNumber';

export async function seedStudentAssignments(
  prisma: PrismaClient,
  tenantIds: number[],
  assignmentIds: number[],
  studentIds: number[],
  teacherIds: number[],
  usernameToId: Record<string, number>,
  bootstrapUserId: number
): Promise<number[]> {
  const studentAssignmentIds: number[] = [];
  for (const item of studentAssignments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedAssignmentId = ensureNumber(
      typeof item.assignment_id === 'number' && assignmentIds[item.assignment_id - 1] !== undefined ? assignmentIds[item.assignment_id - 1] : assignmentIds[0],
      `Invalid mappedAssignmentId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedGradedBy = (item.graded_by != null && teacherIds[item.graded_by - 1] !== undefined
      ? teacherIds[item.graded_by - 1]
      : null) ?? null;
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUserId;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUserId : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUserId : null);
    const studentAssignment = await prisma.studentAssignment.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        assignment_id: mappedAssignmentId,
        student_id: mappedStudentId,
        graded_by: mappedGradedBy,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    studentAssignmentIds.push(studentAssignment.student_assignment_id);
  }
  console.log('Seeded student assignments');
  return studentAssignmentIds;
}
