import { PrismaClient } from '@prisma/client';
import assignmentSubmissionFiles from '../seed-data/assignment_submission_files';
import { ensureNumber } from './utils/ensureNumber';

export async function seedAssignmentSubmissionFiles(
  prisma: PrismaClient,
  tenantIds: number[],
  studentAssignmentIds: number[],
  usernameToId: Record<string, number>,
  bootstrapUserId: number
) {
  for (const item of assignmentSubmissionFiles) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignmentSubmissionFiles entry: ${JSON.stringify(item)}`
    );
    const mappedStudentAssignmentId = ensureNumber(
      typeof item.student_assignment_id === 'number' && studentAssignmentIds[item.student_assignment_id - 1] !== undefined ? studentAssignmentIds[item.student_assignment_id - 1] : studentAssignmentIds[0],
      `Invalid mappedStudentAssignmentId for assignmentSubmissionFiles entry: ${JSON.stringify(item)}`
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
    // Remove uploaded_at property if present, as it is not in the Prisma schema
    const { uploaded_at, ...rest } = item;
    await prisma.assignmentSubmissionFile.create({
      data: {
        ...rest,
        tenant_id: mappedTenantId,
        student_assignment_id: mappedStudentAssignmentId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded assignment submission files');
}
