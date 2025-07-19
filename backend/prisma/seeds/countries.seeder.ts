import { PrismaClient } from '@prisma/client';
import { countries } from '../seed-data/countries';

/**
 * Seeds the countries table and returns created country IDs.
 * @param prisma PrismaClient instance
 * @param auditMaps Audit maps for user index to system_user_id
 * @param fallbackUserId System user ID for fallback audit fields
 * @returns Array of created country IDs
 */
export async function seedCountries(
  prisma: PrismaClient,
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  fallbackUserId: number
): Promise<number[]> {
  const countryIds: number[] = [];
  for (const item of countries) {
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
    const country = await prisma.country.create({
      data: {
        ...item,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    countryIds.push(country.country_id);
  }
  console.log('Seeded countries');
  return countryIds;
}
