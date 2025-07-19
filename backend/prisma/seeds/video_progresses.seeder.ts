import { PrismaClient } from '@prisma/client';
import { video_progresses } from '../seed-data/video_progresses';
import { ensureNumber } from './utils/ensureNumber';

export async function seedVideoProgresses(
  prisma: PrismaClient,
  tenantIds: number[],
  studentIds: number[],
  courseVideoIds: number[],
  auditMaps: any,
  bootstrapUserId: number
) {
  const { usernameToId } = auditMaps;
  for (const item of video_progresses) {
    let mappedTenantId: number = (typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined && tenantIds[item.tenant_id - 1] != null)
      ? tenantIds[item.tenant_id - 1]!
      : tenantIds[0]!;
    let mappedStudentId: number = (typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined && studentIds[item.student_id - 1] != null)
      ? studentIds[item.student_id - 1]!
      : studentIds[0]!;
    let mappedCourseVideoId: number = (typeof item.course_video_id === 'number' && courseVideoIds[item.course_video_id - 1] !== undefined && courseVideoIds[item.course_video_id - 1] != null)
      ? courseVideoIds[item.course_video_id - 1]!
      : courseVideoIds[0]!;
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUserId;
    let mappedUpdatedBy: number = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : bootstrapUserId;
    let mappedDeletedBy: number = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : bootstrapUserId;
    await prisma.videoProgress.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        course_video_id: mappedCourseVideoId,
        watch_duration_seconds: item.watch_duration_seconds ?? 0,
        completion_percentage: item.completion_percentage ?? 0,
        last_watched_at: item.last_watched_at ?? new Date(),
        is_completed: item.is_completed ?? false,
        is_active: item.is_active ?? true,
        is_deleted: item.is_deleted ?? false,
        created_at: item.created_at ?? new Date(),
        created_by: mappedCreatedBy,
        created_ip: item.created_ip ?? '',
        updated_at: item.updated_at ?? null,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip ?? '',
        deleted_at: item.deleted_at ?? null,
        deleted_by: mappedDeletedBy,
      },
    });
  }
  console.log('Seeded video progresses');
}
