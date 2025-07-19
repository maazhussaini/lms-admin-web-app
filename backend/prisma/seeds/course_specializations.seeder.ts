import { PrismaClient } from '@prisma/client';
import { course_specializations } from '../seed-data/course_specializations';
import { ensureNumber } from './utils/ensureNumber.js';

/**
 * Modular seeder for course_specializations (junction table)
 * @param prisma PrismaClient instance
 * @param courseIds Array of course IDs
 * @param specializationIds Array of specialization IDs
 * @param auditMaps Audit mapping helpers
 * @returns void
 */
export async function seedCourseSpecializations(
  prisma: PrismaClient,
  courseIds: number[],
  specializationIds: number[],
  auditMaps: any
): Promise<void> {
  for (const item of course_specializations) {
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_specializations entry: ${JSON.stringify(item)}`
    );
    const mappedSpecializationId = ensureNumber(
      typeof item.specialization_id === 'number' && specializationIds[item.specialization_id - 1] !== undefined ? specializationIds[item.specialization_id - 1] : specializationIds[0],
      `Invalid mappedSpecializationId for course_specializations entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number | null = item.created_by;
    let mappedUpdatedBy: number | null = item.updated_by;
    let mappedDeletedBy: number | null = item.deleted_by;
    if (auditMaps && item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : item.created_by;
      }
    }
    if (auditMaps && item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = (typeof id === 'number') ? id : null;
      }
    }
    if (auditMaps && item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = (typeof id === 'number') ? id : null;
      }
    }
    await prisma.courseSpecialization.create({
      data: {
        course_id: mappedCourseId,
        specialization_id: mappedSpecializationId,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
        created_ip: item.created_ip,
        updated_ip: item.updated_ip
      },
    });
  }
  console.log('Seeded course specializations');
}
