import { PrismaClient } from '@prisma/client';
import { course_documents } from '../seed-data/course_documents';
import { ensureNumber } from './utils/ensureNumber';

export async function seedCourseDocuments(
  prisma: PrismaClient,
  tenantIds: number[],
  courseIds: number[],
  courseTopicIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<void> {
  for (const item of course_documents) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_documents entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_documents entry: ${JSON.stringify(item)}`
    );
    const mappedTopicId = ensureNumber(
      typeof item.course_topic_id === 'number' && courseTopicIds[item.course_topic_id - 1] !== undefined ? courseTopicIds[item.course_topic_id - 1] : courseTopicIds[0],
      `Invalid mappedTopicId for course_documents entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUserId;
      }
    }
    let mappedUpdatedBy: number | null = null;
    if (item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = (typeof id === 'number') ? id : null;
      }
    }
    let mappedDeletedBy: number | null = null;
    if (item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = (typeof id === 'number') ? id : null;
      }
    }
    await prisma.courseDocument.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        course_topic_id: mappedTopicId,
        document_name: item.document_name,
        document_url: item.document_url,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
        created_ip: item.created_ip,
        updated_ip: item.updated_ip,
      },
    });
  }
  console.log('Seeded course documents');
}
