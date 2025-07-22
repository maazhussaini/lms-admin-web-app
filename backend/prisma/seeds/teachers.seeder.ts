import { PrismaClient } from '@prisma/client';
import { teachers } from '../seed-data/teachers';
/**
 * Password Hashing Note:
 * ----------------------
 * The teacher seeder now hashes the plain password from seed-data/teachers.ts using the project's hashPassword utility.
 * This ensures all seeded teachers have secure, production-grade password hashes.
 * Do NOT include pre-hashed passwords in the seed data; always use a plain password field.
 * The hashPassword function uses bcrypt with 12 salt rounds (OWASP recommended).
 * The CLI utility (npm run hash-password) uses the same logic for manual password generation.
 */
import { hashPassword } from '../../src/utils/password.utils';
import { ensureNumber } from './utils/ensureNumber.js';

/**
 * Modular seeder for teachers table
 * @param prisma PrismaClient instance
 * @param tenantIds Array of tenant IDs
 * @param countryIds Array of country IDs
 * @param stateIds Array of state IDs
 * @param allCities Array of city objects
 * @param auditMaps Audit mapping helpers
 * @param bootstrapUserId Fallback system user ID
 * @returns Array of created teacher IDs
 */
export async function seedTeachers(
  prisma: PrismaClient,
  tenantIds: number[],
  countryIds: number[],
  stateIds: number[],
  allCities: any[],
  auditMaps: any,
  bootstrapUserId: number
): Promise<number[]> {
  const teacherIds: number[] = [];
  for (const item of teachers) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for teachers entry: ${JSON.stringify(item)}`
    );
    const mappedCountryId = ensureNumber(
      typeof item.country_id === 'number' && countryIds[item.country_id - 1] !== undefined ? countryIds[item.country_id - 1] : countryIds[0],
      `Invalid mappedCountryId for teachers entry: ${JSON.stringify(item)}`
    );
    const mappedStateId = ensureNumber(
      typeof item.state_id === 'number' && stateIds[item.state_id - 1] !== undefined ? stateIds[item.state_id - 1] : stateIds[0],
      `Invalid mappedStateId for teachers entry: ${JSON.stringify(item)}`
    );
    let mappedCityId: number;
    if (typeof item.city_id === 'number') {
      const cityObj = allCities[item.city_id - 1];
      if (cityObj && typeof cityObj.city_id === 'number') {
        mappedCityId = ensureNumber(
          cityObj.city_id,
          `Invalid mappedCityId for teachers entry: ${JSON.stringify(item)}`
        );
      } else {
        mappedCityId = ensureNumber(
          allCities[0]?.city_id,
          `Invalid mappedCityId for teachers entry (no cities available): ${JSON.stringify(item)}`
        );
      }
    } else {
      mappedCityId = ensureNumber(
        allCities[0]?.city_id,
        `Invalid mappedCityId for teachers entry (no cities available): ${JSON.stringify(item)}`
      );
    }
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
    // Hash the plain password before inserting
    const passwordHash = await hashPassword(item.password);
    const teacher = await prisma.teacher.create({
      data: {
        tenant_id: mappedTenantId,
        full_name: item.full_name,
        first_name: item.first_name,
        middle_name: item.middle_name,
        last_name: item.last_name,
        country_id: mappedCountryId,
        state_id: mappedStateId,
        city_id: mappedCityId,
        address: item.address,
        date_of_birth: item.date_of_birth,
        profile_picture_url: item.profile_picture_url,
        zip_code: item.zip_code,
        age: item.age,
        gender: item.gender,
        username: item.username,
        password_hash: passwordHash,
        last_login_at: item.last_login_at,
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
    teacherIds.push(teacher.teacher_id);
  }
  console.log('Seeded teachers');
  return teacherIds;
}
