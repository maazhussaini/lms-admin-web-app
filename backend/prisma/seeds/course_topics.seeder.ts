import { PrismaClient } from '@prisma/client';
import { course_topics } from '../seed-data/course_topics';
import { ensureNumber } from './utils/ensureNumber';

export async function seedCourseTopics(
  prisma: PrismaClient,
  tenantIds: number[],
  courseModuleIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<number[]> {
  const courseTopicIds: number[] = [];
  for (const item of course_topics) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_topics entry: ${JSON.stringify(item)}`
    );
    const mappedModuleId = ensureNumber(
      typeof item.module_id === 'number' && courseModuleIds[item.module_id - 1] !== undefined ? courseModuleIds[item.module_id - 1] : courseModuleIds[0],
      `Invalid mappedModuleId for course_topics entry: ${JSON.stringify(item)}`
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
    const courseTopic = await prisma.courseTopic.create({
      data: {
        tenant_id: mappedTenantId,
        module_id: mappedModuleId,
        course_topic_name: item.course_topic_name,
        position: item.position,
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
    courseTopicIds.push(courseTopic.course_topic_id);
  }
  console.log('Seeded course topics');
  return courseTopicIds;
}
