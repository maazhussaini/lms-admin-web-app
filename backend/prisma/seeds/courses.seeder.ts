import { PrismaClient } from '@prisma/client';
import { courses } from '../seed-data/courses';
import { ensureNumber } from './utils/ensureNumber.js';

/**
 * Modular seeder for courses table
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs
 * @param auditMaps Audit mapping helpers
 * @param bootstrapUserId Fallback system user ID
 * @returns Array of created course IDs
 */
export async function seedCourses(
  prisma: PrismaClient,
  tenantIds: number[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<number[]> {
  const courseIds: number[] = [];
  for (const item of courses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for courses entry: ${JSON.stringify(item)}`
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
    const course = await prisma.course.create({
      data: {
        tenant_id: mappedTenantId,
        course_name: item.course_name,
        course_description: item.course_description,
        main_thumbnail_url: item.main_thumbnail_url,
        course_status: item.course_status,
        course_type: item.course_type,
        course_price: item.course_price,
        course_total_hours: item.course_total_hours,
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
    courseIds.push(course.course_id);
  }
  console.log('Seeded courses');
  return courseIds;
}
