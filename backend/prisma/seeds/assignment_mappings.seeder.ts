import { PrismaClient } from '@prisma/client';
import assignmentMappings from '../seed-data/assignment_mappings';
import { ensureNumber } from './utils/ensureNumber';

export async function seedAssignmentMappings(
  prisma: PrismaClient,
  tenantIds: number[],
  assignmentIds: number[],
  courseIds: number[],
  courseModuleIds: number[],
  courseTopicIds: number[],
  teacherIds: number[],
  usernameToId: Record<string, number>,
  bootstrapUserId: number
) {
  for (const item of assignmentMappings) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignmentMappings entry: ${JSON.stringify(item)}`
    );
    const mappedAssignmentId = ensureNumber(
      typeof item.assignment_id === 'number' && assignmentIds[item.assignment_id - 1] !== undefined ? assignmentIds[item.assignment_id - 1] : assignmentIds[0],
      `Invalid mappedAssignmentId for assignmentMappings entry: ${JSON.stringify(item)}`
    );
    let mappedReferenceId: number;
    if (item.reference_table_type === 'COURSE' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseIds[item.reference_id - 1] !== undefined ? courseIds[item.reference_id - 1] : courseIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else if (item.reference_table_type === 'COURSE_MODULE' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseModuleIds[item.reference_id - 1] !== undefined ? courseModuleIds[item.reference_id - 1] : courseModuleIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else if (item.reference_table_type === 'COURSE_TOPIC' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseTopicIds[item.reference_id - 1] !== undefined ? courseTopicIds[item.reference_id - 1] : courseTopicIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else {
      mappedReferenceId = 1; // fallback, should never happen if data is correct
    }
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for assignmentMappings entry: ${JSON.stringify(item)}`
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
    await prisma.assignmentMapping.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        assignment_id: mappedAssignmentId,
        reference_id: mappedReferenceId,
        teacher_id: mappedTeacherId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded assignment mappings');
}
