import { PrismaClient } from '@prisma/client';
import { specialization_programs } from '../seed-data/specialization_programs';

export async function seedSpecializationPrograms(
  prisma: PrismaClient,
  specializationIds: number[],
  programIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  bootstrapUserId: number
): Promise<number[]> {
  const specializationProgramIds: number[] = [];
  for (const item of specialization_programs) {
    const mappedSpecializationId = specializationIds[item.specialization_id - 1];
    const mappedProgramId = programIds[item.program_id - 1];
    let mappedCreatedBy: number | null = item.created_by;
    let mappedUpdatedBy: number | null = item.updated_by;
    let mappedDeletedBy: number | null = item.deleted_by;
    if (auditMaps && item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = typeof id === 'number' ? id : bootstrapUserId;
      }
    }
    if (auditMaps && item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = typeof id === 'number' ? id : null;
      }
    }
    if (auditMaps && item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = typeof id === 'number' ? id : null;
      }
    }
    if (mappedSpecializationId && mappedProgramId) {
      const specializationProgram = await prisma.specializationProgram.create({
        data: {
          specialization_id: mappedSpecializationId,
          program_id: mappedProgramId,
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
      specializationProgramIds.push(specializationProgram.specialization_program_id);
    }
  }
  console.log('Seeded specialization programs');
  return specializationProgramIds;
}
