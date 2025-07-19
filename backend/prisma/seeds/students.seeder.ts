import { PrismaClient } from '@prisma/client';
import { students } from '../seed-data/students';

export async function seedStudents(
  prisma: PrismaClient,
  tenantIds: number[],
  countryIds: number[],
  stateIds: number[],
  allCities: { city_id: number }[],
  auditMaps: { user: any[]; usernameToId: { [key: string]: number } },
  bootstrapUserId: number
): Promise<number[]> {
  const studentIds: number[] = [];
  for (const item of students) {
    const mappedTenantId =
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined
        ? tenantIds[item.tenant_id - 1]
        : tenantIds[0];
    const mappedCountryId =
      typeof item.country_id === 'number' && countryIds[item.country_id - 1] !== undefined
        ? countryIds[item.country_id - 1]
        : countryIds[0];
    const mappedStateId =
      typeof item.state_id === 'number' && stateIds[item.state_id - 1] !== undefined
        ? stateIds[item.state_id - 1]
        : stateIds[0];
    let mappedCityId: number;
    if (typeof item.city_id === 'number') {
      const cityObj = allCities[item.city_id - 1];
      if (cityObj && typeof cityObj.city_id === 'number') {
        mappedCityId = cityObj.city_id;
      } else {
        mappedCityId = allCities[0]?.city_id;
      }
    } else {
      mappedCityId = allCities[0]?.city_id;
    }
    let mappedCreatedBy = bootstrapUserId;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = typeof id === 'number' ? id : bootstrapUserId;
      }
    }
    let mappedUpdatedBy: number | null = null;
    if (item.updated_by != null) {
      const userObj = auditMaps.user[item.updated_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedUpdatedBy = typeof id === 'number' ? id : null;
      }
    }
    let mappedDeletedBy: number | null = null;
    if (item.deleted_by != null) {
      const userObj = auditMaps.user[item.deleted_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedDeletedBy = typeof id === 'number' ? id : null;
      }
    }
    const student = await prisma.student.create({
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
        password_hash: item.password_hash,
        last_login_at: item.last_login_at,
        student_status: item.student_status,
        referral_type: item.referral_type,
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
    studentIds.push(student.student_id);
  }
  console.log('Seeded students');
  return studentIds;
}
