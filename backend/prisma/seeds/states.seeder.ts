import { PrismaClient } from '@prisma/client';
import { states } from '../seed-data/states';

/**
 * Seeds the states table and returns created state IDs.
 * @param prisma PrismaClient instance
 * @param countryIds Array of country IDs (ordered)
 * @param auditMaps Audit maps for user index to system_user_id
 * @param fallbackUserId System user ID for fallback audit fields
 * @returns Array of created state IDs
 */
export async function seedStates(
  prisma: PrismaClient,
  countryIds: number[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  fallbackUserId: number
): Promise<number[]> {
  const stateIds: number[] = [];
  for (const item of states) {
    // Map country_id by array index
    const mappedCountryId = countryIds[(item.country_id ?? 1) - 1];
    if (typeof mappedCountryId !== 'number' || isNaN(mappedCountryId)) {
      throw new Error(`Invalid mappedCountryId for states entry: ${JSON.stringify(item)}`);
    }
    // Map audit fields from seed data using auditMaps
    let mappedCreatedBy = fallbackUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : fallbackUserId;
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
    const state = await prisma.state.create({
      data: {
        ...item,
        country_id: mappedCountryId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    stateIds.push(state.state_id);
  }
  console.log('Seeded states');
  return stateIds;
}
