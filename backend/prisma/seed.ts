import { config } from 'dotenv';
config({ path: '../backend/.env' });
import { PrismaClient } from '@prisma/client';
import { roles } from './seed-data/roles';
import { system_users } from './seed-data/system_users';
import { screens } from './seed-data/screens';
import { user_screens } from './seed-data/user_screens';
import { role_screens } from './seed-data/role_screens';
import { tenants } from './seed-data/tenants';
import { clients } from './seed-data/clients';
import { tenant_phone_numbers } from './seed-data/tenant_phone_numbers';
import { tenant_email_addresses } from './seed-data/tenant_email_addresses';
import { client_tenants } from './seed-data/client_tenants';
import { countries } from './seed-data/countries';
import { states } from './seed-data/states';
import { cities } from './seed-data/cities';
import { programs } from './seed-data/programs';
import { specializations } from './seed-data/specializations';
import { specialization_programs } from './seed-data/specialization_programs';
import { institutes } from './seed-data/institutes';
import { students } from './seed-data/students';
import { student_email_addresses } from './seed-data/student_email_addresses';
import { student_phone_numbers } from './seed-data/student_phone_numbers';
import { student_devices } from './seed-data/student_devices';
import { student_institutes } from './seed-data/student_institutes';
import { teachers } from './seed-data/teachers';
import { teacher_email_addresses } from './seed-data/teacher_email_addresses';
import { teacher_phone_numbers } from './seed-data/teacher_phone_numbers';
import { courses } from './seed-data/courses';
import { course_specializations } from './seed-data/course_specializations';
import { course_modules } from './seed-data/course_modules';
import { course_topics } from './seed-data/course_topics';
import { course_videos } from './seed-data/course_videos';
import { course_documents } from './seed-data/course_documents';
import { enrollments } from './seed-data/enrollments';
import { enrollment_status_histories } from './seed-data/enrollment_status_histories';
import { student_course_progresses } from './seed-data/student_course_progresses';
import { teacher_courses } from './seed-data/teacher_courses';
import { course_sessions } from './seed-data/course_sessions';
import { course_session_enrollments } from './seed-data/course_session_enrollments';
import { course_session_settings } from './seed-data/course_session_settings';
import { video_progresses } from './seed-data/video_progresses';
import { quizzes } from './seed-data/quizzes';
import { quiz_mappings } from './seed-data/quiz_mappings';
import { quiz_questions } from './seed-data/quiz_questions';
import { quiz_question_options } from './seed-data/quiz_question_options';
import { quiz_question_answers } from './seed-data/quiz_question_answers';
import { quiz_attempts } from './seed-data/quiz_attempts';
import { quiz_attempt_answers } from './seed-data/quiz_attempt_answers';
import { assignments } from './seed-data/assignments';
import { assignmentMappings } from './seed-data/assignment_mappings';
import { studentAssignments } from './seed-data/student_assignments';
import { assignmentSubmissionFiles } from './seed-data/assignment_submission_files';

const prisma = new PrismaClient();

// Helper to ensure mapped foreign key is always a valid number
function ensureNumber(val: any, errorMsg: string): number {
  if (typeof val === 'number' && !isNaN(val)) return val;
  throw new Error(errorMsg);
}

async function seedFirstPass({ model, data, uniqueKey, auditUserId, foreignKeyMaps = {} }: {
  model: any,
  data: AnyObj[],
  uniqueKey: string,
  auditUserId: number | null,
  foreignKeyMaps?: { [key: string]: { [key: string]: any } }
}) {
  await Promise.all(data.map((item: AnyObj) => {
    const { created_by, updated_by, deleted_by, ...rest } = item;
    const foreignKeys = Object.fromEntries(
      Object.entries(foreignKeyMaps).map(([field, map]) => [field, map && map[item[field]]])
    );
    return model.upsert({
      where: { [uniqueKey]: item[uniqueKey] },
      update: {},
      create: {
        ...rest,
        ...foreignKeys,
        created_by: auditUserId,
        updated_by: auditUserId,
        deleted_by: auditUserId,
      },
    });
  }));
}

type AnyObj = { [key: string]: any };
async function updateAuditFields({ model, data, uniqueKey, auditMaps }: {
  model: any,
  data: AnyObj[],
  uniqueKey: string,
  auditMaps: { user: AnyObj[], usernameToId: { [key: string]: number } }
}) {
  await Promise.all(data.map(async (item: AnyObj) => {
    const updateData: { [key: string]: number | null } = {};
    ['created_by', 'updated_by', 'deleted_by'].forEach(field => {
      if (item[field] != null) {
        const user = auditMaps.user[item[field] - 1];
        updateData[field] = user ? (auditMaps.usernameToId[user['username']] ?? null) : null;
      }
    });
    if (Object.keys(updateData).length > 0) {
      await model.update({
        where: { [uniqueKey]: item[uniqueKey] },
        data: updateData,
      });
    }
  }));
}

async function main() {
  // Null out audit fields in roles to break dependency
  await prisma.role.updateMany({ data: { created_by: null, updated_by: null, deleted_by: null } });

  // Clean up: delete child tables first, then parent tables
  // --- ASSIGNMENT TABLES ---
  await prisma.assignmentSubmissionFile.deleteMany({});
  await prisma.studentAssignment.deleteMany({});
  await prisma.assignmentMapping.deleteMany({});
  await prisma.assignment.deleteMany({});

  // --- QUIZ/ASSESSMENT TABLES ---
  await prisma.quizAttemptAnswer.deleteMany({});
  await prisma.quizAttempt.deleteMany({});
  await prisma.quizQuestionAnswer.deleteMany({});
  await prisma.quizQuestionOption.deleteMany({});
  await prisma.quizQuestion.deleteMany({});
  await prisma.quizMapping.deleteMany({});
  await prisma.quiz.deleteMany({});

  // --- ENROLLMENT/PROGRESS TABLES ---
  await prisma.videoProgress.deleteMany({});
  await prisma.courseSessionSettings.deleteMany({});
  await prisma.courseSessionEnrollment.deleteMany({});
  await prisma.courseSession.deleteMany({});
  await prisma.teacherCourse.deleteMany({});
  await prisma.studentCourseProgress.deleteMany({});
  await prisma.enrollmentStatusHistory.deleteMany({});
  await prisma.enrollment.deleteMany({});

  // --- COURSE/CONTENT TABLES ---
  await prisma.courseDocument.deleteMany({});
  await prisma.courseVideo.deleteMany({});
  await prisma.courseTopic.deleteMany({});
  await prisma.courseModule.deleteMany({});
  await prisma.courseSpecialization.deleteMany({});
  await prisma.course.deleteMany({});

  // --- TEACHER-RELATED TABLES ---
  await prisma.teacherPhoneNumber.deleteMany({});
  await prisma.teacherEmailAddress.deleteMany({});
  await prisma.teacher.deleteMany({});

  // --- STUDENT-RELATED AND INSTITUTE-RELATED TABLES ---
  await prisma.studentInstitute.deleteMany({});
  await prisma.studentDevice.deleteMany({});
  await prisma.studentPhoneNumber.deleteMany({});
  await prisma.studentEmailAddress.deleteMany({});
  await prisma.student.deleteMany({});
  await prisma.institute.deleteMany({});

  // --- OTHER TABLES ---
  await prisma.roleScreen.deleteMany({});
  await prisma.userScreen.deleteMany({});
  await prisma.screen.deleteMany({});
  await prisma.clientTenant.deleteMany({});
  await prisma.tenantPhoneNumber.deleteMany({});
  await prisma.tenantEmailAddress.deleteMany({});
  await prisma.specializationProgram.deleteMany({});
  await prisma.specialization.deleteMany({});
  await prisma.program.deleteMany({});
  await prisma.city.deleteMany({});
  await prisma.state.deleteMany({});
  await prisma.country.deleteMany({});
  await prisma.client.deleteMany({});

  // Break circular dependency: null audit fields in tenants and tenant_id in system users
  // Use bootstrap admin's system_user_id for audit fields to break circular dependency
  const bootstrapAdmin = await prisma.systemUser.findFirst({ where: { username: 'bootstrap_admin' } });
  const bootstrapAdminId = bootstrapAdmin ? bootstrapAdmin.system_user_id : 1;
  await prisma.tenant.updateMany({ data: { created_by: bootstrapAdminId, updated_by: bootstrapAdminId, deleted_by: bootstrapAdminId } });
  await prisma.systemUser.updateMany({ data: { tenant_id: null } });

  // Delete all system users except bootstrap admin
  await prisma.systemUser.deleteMany({ where: { username: { not: 'bootstrap_admin' } } });
  // Delete tenants
  await prisma.tenant.deleteMany({});
  // Delete bootstrap admin
  await prisma.systemUser.deleteMany({ where: { username: 'bootstrap_admin' } });
  // Delete roles
  await prisma.role.deleteMany({});

  // 1. Seed Roles
  await seedFirstPass({
    model: prisma.role,
    data: roles,
    uniqueKey: 'role_type',
    auditUserId: null,
  });

  // 2. Bootstrap system user
  let bootstrapUser = await prisma.systemUser.findFirst({ where: { username: 'bootstrap_admin' } });
  if (!bootstrapUser) {
    bootstrapUser = await prisma.systemUser.create({
      data: {
        tenant_id: null,
        role_type: 'SUPER_ADMIN',
        username: 'bootstrap_admin',
        full_name: 'Bootstrap Admin',
        email_address: 'bootstrap@sys.com',
        password_hash: 'bootstrap_pw',
        last_login_at: new Date(),
        login_attempts: 0,
        system_user_status: 'ACTIVE',
        is_active: true,
        is_deleted: false,
        created_at: new Date(),
        updated_at: new Date(),
        created_by: null,
        updated_by: null,
        deleted_at: null,
        deleted_by: null,
        created_ip: '127.0.0.1',
        updated_ip: '127.0.0.1',
      },
    });
  }

  // 3. Seed Tenants
  await seedFirstPass({
    model: prisma.tenant,
    data: tenants,
    uniqueKey: 'tenant_name',
    auditUserId: bootstrapUser.system_user_id,
  });

  // Build tenant IDs by order (after tenants are seeded)
  const tenantIds: number[] = [];
  const allTenants = await prisma.tenant.findMany({ orderBy: { tenant_id: 'asc' } });
  for (const t of allTenants) {
    tenantIds.push(t.tenant_id);
  }

  // 4. Seed SystemUsers (map tenant_id using tenantIds array)
  await Promise.all(system_users.map(async (item: any) => {
    let mappedTenantId: number | null = null;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      mappedTenantId = tenantIds[item.tenant_id - 1] ?? null;
      if (item.tenant_id && (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId))) {
        throw new Error(`Invalid mappedTenantId for system_users entry: ${JSON.stringify(item)}`);
      }
    }
    await prisma.systemUser.upsert({
      where: { username: item.username },
      update: {},
      create: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: bootstrapUser.system_user_id,
        updated_by: bootstrapUser.system_user_id,
        deleted_by: bootstrapUser.system_user_id,
      },
    });
  }));

  // Build audit maps
  const allUsers = await prisma.systemUser.findMany();
  const usernameToId = Object.fromEntries(allUsers.map(u => [u.username, u.system_user_id]));
  const auditMaps = { user: system_users, usernameToId };

  // 5. Second pass: update all roles with correct audit fields
  await updateAuditFields({
    model: prisma.role,
    data: roles,
    uniqueKey: 'role_type',
    auditMaps,
  });

  // 6. Second pass: update all users with correct audit fields
  await updateAuditFields({
    model: prisma.systemUser,
    data: system_users,
    uniqueKey: 'username',
    auditMaps,
  });

  // 37. Seed Screens and collect IDs by order
  const screenIds: number[] = [];
  for (const item of screens) {
    // parent_screen_id is a 1-based index in seed data, map to actual screen_id or null
    let mappedParentScreenId: number | null = null;
    if (typeof item.parent_screen_id === 'number' && item.parent_screen_id !== null) {
      mappedParentScreenId = screenIds[item.parent_screen_id - 1] ?? null;
    }
    // Map audit fields
    let mappedCreatedBy = (item.created_by != null && usernameToId[item.created_by] !== undefined)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);

    const screen = await prisma.screen.create({
      data: {
        ...item,
        parent_screen_id: mappedParentScreenId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    screenIds.push(screen.screen_id);
  }

  // 38. Seed UserScreens
  for (const item of user_screens) {
    // Map tenant_id, system_user_id, screen_id by array index (1-based in seed data)
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for user_screens entry: ${JSON.stringify(item)}`
    );
    const mappedSystemUserId = ensureNumber(
      (() => {
        let userObj = (typeof item.system_user_id === 'number') ? allUsers[item.system_user_id - 1] : undefined;
        return (userObj && typeof userObj.system_user_id === 'number')
          ? userObj.system_user_id
          : (allUsers[0]?.system_user_id ?? 1);
      })(),
      `Invalid mappedSystemUserId for user_screens entry: ${JSON.stringify(item)}`
    );
    const mappedScreenId = ensureNumber(
      typeof item.screen_id === 'number' && screenIds[item.screen_id - 1] !== undefined ? screenIds[item.screen_id - 1] : screenIds[0],
      `Invalid mappedScreenId for user_screens entry: ${JSON.stringify(item)}`
    );
    // Map audit fields
    let mappedCreatedBy = (item.created_by != null && usernameToId[item.created_by] !== undefined)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);

    await prisma.userScreen.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        system_user_id: mappedSystemUserId,
        screen_id: mappedScreenId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 39. Seed RoleScreens
  for (const item of role_screens) {
    // Map tenant_id, screen_id by array index (1-based in seed data)
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for role_screens entry: ${JSON.stringify(item)}`
    );
    const mappedScreenId = ensureNumber(
      typeof item.screen_id === 'number' && screenIds[item.screen_id - 1] !== undefined ? screenIds[item.screen_id - 1] : screenIds[0],
      `Invalid mappedScreenId for role_screens entry: ${JSON.stringify(item)}`
    );
    // Map audit fields
    let mappedCreatedBy = (item.created_by != null && usernameToId[item.created_by] !== undefined)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);

    await prisma.roleScreen.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        screen_id: mappedScreenId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 7. Seed Clients and collect IDs by order (map tenant_id using tenantIds array)
  const clientIds: number[] = [];
  for (const item of clients) {
    let mappedTenantId: number;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      const possibleTenantId = tenantIds[item.tenant_id - 1];
      if (typeof possibleTenantId !== 'number' || isNaN(possibleTenantId)) {
        throw new Error(`Invalid mappedTenantId for clients entry: ${JSON.stringify(item)}`);
      }
      mappedTenantId = possibleTenantId;
    } else {
      throw new Error(`Missing tenant_id for clients entry: ${JSON.stringify(item)}`);
    }
    const client = await prisma.client.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        created_by: bootstrapUser.system_user_id,
        updated_by: bootstrapUser.system_user_id,
        deleted_by: bootstrapUser.system_user_id,
      },
    });
    clientIds.push(client.client_id);
  }

  // 8. Seed TenantPhoneNumbers (map tenant_id using tenantIds array)
  await Promise.all(tenant_phone_numbers.map(async (item: any) => {
    let mappedTenantId: number;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      const possibleTenantId = tenantIds[item.tenant_id - 1];
      if (typeof possibleTenantId !== 'number' || isNaN(possibleTenantId)) {
        throw new Error(`Invalid mappedTenantId for tenant_phone_numbers entry: ${JSON.stringify(item)}`);
      }
      mappedTenantId = possibleTenantId;
    } else {
      throw new Error(`Missing tenant_id for tenant_phone_numbers entry: ${JSON.stringify(item)}`);
    }
    await prisma.tenantPhoneNumber.create({
      data: { ...item, tenant_id: mappedTenantId, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
  }));

  // 9. Seed TenantEmailAddresses (map tenant_id using tenantIds array)
  await Promise.all(tenant_email_addresses.map(async (item: any) => {
    let mappedTenantId: number;
    if (typeof item.tenant_id === 'number' && item.tenant_id !== null) {
      const possibleTenantId = tenantIds[item.tenant_id - 1];
      if (typeof possibleTenantId !== 'number' || isNaN(possibleTenantId)) {
        throw new Error(`Invalid mappedTenantId for tenant_email_addresses entry: ${JSON.stringify(item)}`);
      }
      mappedTenantId = possibleTenantId;
    } else {
      throw new Error(`Missing tenant_id for tenant_email_addresses entry: ${JSON.stringify(item)}`);
    }
    await prisma.tenantEmailAddress.create({
      data: { ...item, tenant_id: mappedTenantId, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
  }));

  // ...existing code... (tenantIds and allTenants already declared above)

  // 10. Seed ClientTenants with mapped client_id and tenant_id by array index
  for (const item of client_tenants) {
    // Map by index: assumes client_id and tenant_id in seed data are 1-based and match the order of insertion
    const mappedClientId = clientIds[(item.client_id ?? 1) - 1];
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    if (typeof mappedClientId !== 'number' || isNaN(mappedClientId)) {
      throw new Error(`Invalid mappedClientId for client_tenants entry: ${JSON.stringify(item)}`);
    }
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for client_tenants entry: ${JSON.stringify(item)}`);
    }
    await prisma.clientTenant.create({
      data: {
        ...item,
        client_id: mappedClientId,
        tenant_id: mappedTenantId,
        created_by: bootstrapUser.system_user_id,
        updated_by: bootstrapUser.system_user_id,
        deleted_by: bootstrapUser.system_user_id,
      },
    });
  }

  // 11. Second pass: update audit fields for new models
  // For clients, update audit fields using generated client IDs
  const allClients = await prisma.client.findMany({ orderBy: { client_id: 'asc' } });
  await Promise.all(allClients.map(async (client, idx) => {
    const item = clients[idx];
    if (!item) return;
    const updateData: { [key: string]: number | null } = {};
    ['created_by', 'updated_by', 'deleted_by'].forEach(field => {
      if ((item as any)[field] != null) {
        const user = auditMaps.user[(item as any)[field] - 1];
        updateData[field] = user ? (auditMaps.usernameToId[user['username']] ?? null) : null;
      }
    });
    if (Object.keys(updateData).length > 0) {
      await prisma.client.update({
        where: { client_id: client.client_id },
        data: updateData,
      });
    }
  }));
  // For tenant phone numbers, use tenant_phone_number_id if present (update not possible without unique id)
  // For tenant email addresses, use tenant_email_address_id if present (update not possible without unique id)
  // For client tenants, use client_tenant_id if present (update not possible without unique id)
  // If needed, fetch all records and update by matching on other fields, but for now, skip second pass for these.

  // 12. Seed Countries and collect IDs by order
  const countryIds: number[] = [];
  for (const item of countries) {
    const country = await prisma.country.create({
      data: { ...item, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
    countryIds.push(country.country_id);
  }

  // 13. Seed States, mapping country_id by array index
  const stateIds: number[] = [];
  for (const item of states) {
    const mappedCountryId = countryIds[(item.country_id ?? 1) - 1];
    if (typeof mappedCountryId !== 'number' || isNaN(mappedCountryId)) {
      throw new Error(`Invalid mappedCountryId for states entry: ${JSON.stringify(item)}`);
    }
    const state = await prisma.state.create({
      data: { ...item, country_id: mappedCountryId, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
    stateIds.push(state.state_id);
  }

  // 14. Seed Cities, mapping state_id by array index
  for (const item of cities) {
    const mappedStateId = stateIds[(item.state_id ?? 1) - 1];
    if (typeof mappedStateId !== 'number' || isNaN(mappedStateId)) {
      throw new Error(`Invalid mappedStateId for cities entry: ${JSON.stringify(item)}`);
    }
    await prisma.city.create({
      data: { ...item, state_id: mappedStateId, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
  }
  // Fetch all created cities for mapping
  const allCities = await prisma.city.findMany({ orderBy: { city_id: 'asc' } });

    // 15. Seed Programs and collect IDs by order
  const programIds: number[] = [];
  for (const item of programs) {
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for programs entry: ${JSON.stringify(item)}`);
    }
    const program = await prisma.program.create({
      data: { ...item, tenant_id: mappedTenantId, created_by: bootstrapUser.system_user_id, updated_by: bootstrapUser.system_user_id, deleted_by: bootstrapUser.system_user_id },
    });
    programIds.push(program.program_id);
  }

  // 16. Seed Specializations and collect IDs by order
  const specializationIds: number[] = [];
  for (const item of specializations) {
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    const mappedProgramId = programIds[(item.program_id ?? 1) - 1];
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for specializations entry: ${JSON.stringify(item)}`);
    }
    if (typeof mappedProgramId !== 'number' || isNaN(mappedProgramId)) {
      throw new Error(`Invalid mappedProgramId for specializations entry: ${JSON.stringify(item)}`);
    }
    const specialization = await prisma.specialization.create({
      data: {
        tenant_id: mappedTenantId,
        specialization_name: item.specialization_name,
        specialization_thumbnail_url: item.specialization_thumbnail_url,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        updated_at: item.updated_at,
        created_by: bootstrapUser.system_user_id,
        updated_by: bootstrapUser.system_user_id,
        deleted_at: item.deleted_at,
        deleted_by: item.deleted_by,
        created_ip: item.created_ip,
        updated_ip: item.updated_ip,
      },
    });
    specializationIds.push(specialization.specialization_id);
  }

  // 17. Seed Institutes and collect IDs by order
  const instituteIds: number[] = [];
  for (const item of institutes) {
    // Map tenant_id from 1-based index to actual tenant_id
    const mappedTenantId = tenantIds[(item.tenant_id ?? 1) - 1];
    if (typeof mappedTenantId !== 'number' || isNaN(mappedTenantId)) {
      throw new Error(`Invalid mappedTenantId for institutes entry: ${JSON.stringify(item)}`);
    }
    // Map audit fields (created_by, updated_by, deleted_by) from user index to system_user_id, with safe checks
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    const institute = await prisma.institute.create({
      data: {
        tenant_id: mappedTenantId,
        institute_name: item.institute_name,
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
    instituteIds.push(institute.institute_id);
  }
  
  // Seed SpecializationProgram join table after both specializations and programs are seeded
  const specializationProgramIds: number[] = [];
  const specializationProgramLookup: { [key: string]: number } = {};
  for (const item of specialization_programs) {
    const mappedSpecializationId = specializationIds[item.specialization_id - 1];
    const mappedProgramId = programIds[item.program_id - 1];
    let mappedCreatedBy: number | null = item.created_by;
    let mappedUpdatedBy: number | null = item.updated_by;
    let mappedDeletedBy: number | null = item.deleted_by;
    // If auditMaps and user mapping is available, map user IDs (optional, pattern from other models)
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
      specializationProgramLookup[`${item.specialization_id}_${item.program_id}`] = specializationProgram.specialization_program_id;
    }
  }

  // 18. Seed Students and collect IDs by order
  const studentIds: number[] = [];
  for (const item of students) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for students entry: ${JSON.stringify(item)}`
    );
    const mappedCountryId = ensureNumber(
      typeof item.country_id === 'number' && countryIds[item.country_id - 1] !== undefined ? countryIds[item.country_id - 1] : countryIds[0],
      `Invalid mappedCountryId for students entry: ${JSON.stringify(item)}`
    );
    const mappedStateId = ensureNumber(
      typeof item.state_id === 'number' && stateIds[item.state_id - 1] !== undefined ? stateIds[item.state_id - 1] : stateIds[0],
      `Invalid mappedStateId for students entry: ${JSON.stringify(item)}`
    );
    // Map city_id using allCities array (1-based index from seed data)
    let mappedCityId: number;
    if (typeof item.city_id === 'number') {
      const cityObj = allCities[item.city_id - 1];
      if (cityObj && typeof cityObj.city_id === 'number') {
        mappedCityId = ensureNumber(
          cityObj.city_id,
          `Invalid mappedCityId for students entry: ${JSON.stringify(item)}`
        );
      } else {
        mappedCityId = ensureNumber(
          allCities[0]?.city_id,
          `Invalid mappedCityId for students entry (no cities available): ${JSON.stringify(item)}`
        );
      }
    } else {
      mappedCityId = ensureNumber(
        allCities[0]?.city_id,
        `Invalid mappedCityId for students entry (no cities available): ${JSON.stringify(item)}`
      );
    }
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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

  // 19. Seed StudentEmailAddresses
  for (const item of student_email_addresses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_email_addresses entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_email_addresses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.studentEmailAddress.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        email_address: item.email_address,
        is_primary: item.is_primary,
        priority: item.priority,
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

  // 20. Seed StudentPhoneNumbers
  for (const item of student_phone_numbers) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_phone_numbers entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_phone_numbers entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.studentPhoneNumber.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        dial_code: item.dial_code,
        phone_number: item.phone_number,
        iso_country_code: item.iso_country_code,
        is_primary: item.is_primary,
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

  // 21. Seed StudentDevices
  for (const item of student_devices) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_devices entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_devices entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.studentDevice.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        device_type: item.device_type,
        device_identifier: item.device_identifier,
        device_ip: item.device_ip,
        mac_address: item.mac_address,
        is_primary: item.is_primary,
        last_active_at: item.last_active_at,
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

  // 22. Seed StudentInstitutes
  for (const item of student_institutes) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_institutes entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_institutes entry: ${JSON.stringify(item)}`
    );
    const mappedInstituteId = ensureNumber(
      typeof item.institute_id === 'number' && instituteIds[item.institute_id - 1] !== undefined ? instituteIds[item.institute_id - 1] : instituteIds[0],
      `Invalid mappedInstituteId for student_institutes entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.studentInstitute.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        institute_id: mappedInstituteId,
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
   // 23. Seed Teachers and collect IDs by order
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
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
        password_hash: item.password_hash,
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

  // 24. Seed TeacherEmailAddresses
  for (const item of teacher_email_addresses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for teacher_email_addresses entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for teacher_email_addresses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.teacherEmailAddress.create({
      data: {
        tenant_id: mappedTenantId,
        teacher_id: mappedTeacherId,
        email_address: item.email_address,
        is_primary: item.is_primary,
        priority: item.priority,
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

  // 25. Seed TeacherPhoneNumbers
  for (const item of teacher_phone_numbers) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for teacher_phone_numbers entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for teacher_phone_numbers entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    await prisma.teacherPhoneNumber.create({
      data: {
        tenant_id: mappedTenantId,
        teacher_id: mappedTeacherId,
        dial_code: item.dial_code,
        phone_number: item.phone_number,
        iso_country_code: item.iso_country_code,
        is_primary: item.is_primary,
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
  
  // 26. Seed Courses and collect IDs by order
  const courseIds: number[] = [];
  for (const item of courses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for courses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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

  // 27. Seed CourseSpecializations (junction table)
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

  // 28. Seed CourseModules and collect IDs by order
  const courseModuleIds: number[] = [];
  for (const item of course_modules) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_modules entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_modules entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    const courseModule = await prisma.courseModule.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        course_module_name: item.course_module_name,
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
    courseModuleIds.push(courseModule.course_module_id);
  }

  // 29. Seed CourseTopics and collect IDs by order
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
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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

  // 30. Seed CourseVideos and collect IDs by order
  const courseVideoIds: number[] = [];
  for (const item of course_videos) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_videos entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_videos entry: ${JSON.stringify(item)}`
    );
    const mappedTopicId = ensureNumber(
      typeof item.course_topic_id === 'number' && courseTopicIds[item.course_topic_id - 1] !== undefined ? courseTopicIds[item.course_topic_id - 1] : courseTopicIds[0],
      `Invalid mappedTopicId for course_videos entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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
    const courseVideo = await prisma.courseVideo.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        course_topic_id: mappedTopicId,
        bunny_video_id: item.bunny_video_id,
        video_name: item.video_name,
        video_url: item.video_url,
        thumbnail_url: item.thumbnail_url,
        duration_seconds: item.duration_seconds,
        position: item.position,
        upload_status: item.upload_status,
        is_locked: typeof item.is_locked === 'boolean' ? item.is_locked : false,
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
    courseVideoIds.push(courseVideo.course_video_id);
  }

  // 31. Seed CourseDocuments
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
    let mappedCreatedBy = bootstrapUser.system_user_id;
    if (item.created_by != null) {
      const userObj = auditMaps.user[item.created_by - 1];
      if (userObj && userObj.username) {
        const id = auditMaps.usernameToId[userObj.username];
        mappedCreatedBy = (typeof id === 'number') ? id : bootstrapUser.system_user_id;
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

  // 32. Seed Enrollments and collect IDs by order
  const enrollmentIds: number[] = [];
  for (const item of enrollments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedInstituteId = ensureNumber(
      typeof item.institute_id === 'number' && instituteIds[item.institute_id - 1] !== undefined ? instituteIds[item.institute_id - 1] : instituteIds[0],
      `Invalid mappedInstituteId for enrollments entry: ${JSON.stringify(item)}`
    );
    let mappedTeacherId: number | null = (typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined && teacherIds[item.teacher_id - 1] != null)
      ? teacherIds[item.teacher_id - 1]!
      : null;
    let mappedStatusChangedBy: number | null = (item.status_changed_by != null && usernameToId[item.status_changed_by] !== undefined && usernameToId[item.status_changed_by] != null)
      ? usernameToId[item.status_changed_by]!
      : (item.status_changed_by != null ? bootstrapUser.system_user_id : null);
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    // Map specialization_program_id using direct 1-based index
    const mappedSpecializationProgramId = specializationProgramIds[item.specialization_program_id - 1];
    if (!mappedSpecializationProgramId) {
      throw new Error(`Invalid specialization_program_id mapping for enrollment: ${JSON.stringify(item)}`);
    }
    const enrollment = await prisma.enrollment.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        student_id: mappedStudentId,
        institute_id: mappedInstituteId,
        teacher_id: mappedTeacherId,
        specialization_program_id: mappedSpecializationProgramId,
        course_enrollment_type: item.course_enrollment_type,
        enrollment_status: item.enrollment_status,
        enrolled_at: item.enrolled_at,
        expected_completion_date: item.expected_completion_date,
        actual_completion_date: item.actual_completion_date,
        status_changed_at: item.status_changed_at,
        status_changed_by: mappedStatusChangedBy,
        status_change_reason: item.status_change_reason,
        grade: item.grade,
        final_score: item.final_score,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
    enrollmentIds.push(enrollment.enrollment_id);
  }

  // 33. Seed EnrollmentStatusHistories
  for (const item of enrollment_status_histories) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for enrollment_status_histories entry: ${JSON.stringify(item)}`
    );
    const mappedEnrollmentId = ensureNumber(
      typeof item.enrollment_id === 'number' && enrollmentIds[item.enrollment_id - 1] !== undefined ? enrollmentIds[item.enrollment_id - 1] : enrollmentIds[0],
      `Invalid mappedEnrollmentId for enrollment_status_histories entry: ${JSON.stringify(item)}`
    );
    let mappedChangedBy: number = (item.changed_by != null && usernameToId[item.changed_by] !== undefined && usernameToId[item.changed_by] != null)
      ? usernameToId[item.changed_by]!
      : bootstrapUser.system_user_id;
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    await prisma.enrollmentStatusHistory.create({
      data: {
        tenant_id: mappedTenantId,
        enrollment_id: mappedEnrollmentId,
        previous_status: item.previous_status,
        new_status: item.new_status,
        status_changed_at: item.status_changed_at,
        changed_by: mappedChangedBy,
        change_reason: item.change_reason,
        notes: item.notes,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 34. Seed StudentCourseProgresses
  for (const item of student_course_progresses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for student_course_progresses entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for student_course_progresses entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for student_course_progresses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    await prisma.studentCourseProgress.create({
      data: {
        tenant_id: mappedTenantId,
        student_id: mappedStudentId,
        course_id: mappedCourseId,
        overall_progress_percentage: item.overall_progress_percentage,
        modules_completed: item.modules_completed,
        videos_completed: item.videos_completed,
        quizzes_completed: item.quizzes_completed,
        assignments_completed: item.assignments_completed,
        total_time_spent_minutes: item.total_time_spent_minutes,
        last_accessed_at: item.last_accessed_at,
        is_course_completed: item.is_course_completed,
        completion_date: item.completion_date,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 35. Seed TeacherCourses
  for (const item of teacher_courses) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for teacher_courses entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for teacher_courses entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for teacher_courses entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    await prisma.teacherCourse.create({
      data: {
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        teacher_id: mappedTeacherId,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 36. Seed CourseSessions and collect IDs by order
  const courseSessionIds: number[] = [];
  for (const item of course_sessions) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_sessions entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for course_sessions entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for course_sessions entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    const courseSession = await prisma.courseSession.create({
      data: {
        tenant_id: mappedTenantId,
        teacher_id: mappedTeacherId,
        course_id: mappedCourseId,
        course_session_status: item.course_session_status,
        session_name: item.session_name,
        session_description: item.session_description,
        start_date: item.start_date,
        end_date: item.end_date,
        max_students: item.max_students,
        enrollment_deadline: item.enrollment_deadline,
        session_timezone: item.session_timezone,
        session_code: item.session_code,
        auto_expire_enabled: item.auto_expire_enabled,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
    courseSessionIds.push(courseSession.course_session_id);
  }

  // 37. Seed CourseSessionEnrollments
  for (const item of course_session_enrollments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseSessionId = ensureNumber(
      typeof item.course_session_id === 'number' && courseSessionIds[item.course_session_id - 1] !== undefined ? courseSessionIds[item.course_session_id - 1] : courseSessionIds[0],
      `Invalid mappedCourseSessionId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    const mappedEnrollmentId = ensureNumber(
      typeof item.enrollment_id === 'number' && enrollmentIds[item.enrollment_id - 1] !== undefined ? enrollmentIds[item.enrollment_id - 1] : enrollmentIds[0],
      `Invalid mappedEnrollmentId for course_session_enrollments entry: ${JSON.stringify(item)}`
    );
    await prisma.courseSessionEnrollment.create({
      data: {
        tenant_id: mappedTenantId,
        course_session_id: mappedCourseSessionId,
        student_id: mappedStudentId,
        enrollment_id: mappedEnrollmentId,
        enrolled_at: item.enrolled_at,
        dropped_at: item.dropped_at,
        enrollment_status: item.enrollment_status,
        completion_percentage: item.completion_percentage,
        final_grade: item.final_grade,
        completion_date: item.completion_date,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 38. Seed CourseSessionSettings
  for (const item of course_session_settings) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for course_session_settings entry: ${JSON.stringify(item)}`
    );
    const mappedCourseSessionId = ensureNumber(
      typeof item.course_session_id === 'number' && courseSessionIds[item.course_session_id - 1] !== undefined ? courseSessionIds[item.course_session_id - 1] : courseSessionIds[0],
      `Invalid mappedCourseSessionId for course_session_settings entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    await prisma.courseSessionSettings.create({
      data: {
        tenant_id: mappedTenantId,
        course_session_id: mappedCourseSessionId,
        allow_late_enrollment: item.allow_late_enrollment,
        require_approval_for_enrollment: item.require_approval_for_enrollment,
        allow_student_discussions: item.allow_student_discussions,
        send_reminder_emails: item.send_reminder_emails,
        reminder_days_before_expiry: item.reminder_days_before_expiry,
        grading_scale: item.grading_scale,
        attendance_tracking_enabled: item.attendance_tracking_enabled,
        is_active: item.is_active,
        is_deleted: item.is_deleted,
        created_at: item.created_at,
        created_by: mappedCreatedBy,
        created_ip: item.created_ip,
        updated_at: item.updated_at,
        updated_by: mappedUpdatedBy,
        updated_ip: item.updated_ip,
        deleted_at: item.deleted_at,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 39. Seed VideoProgresses
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
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : bootstrapUser.system_user_id;
    let mappedDeletedBy: number = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : bootstrapUser.system_user_id;
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

  // 40. Seed Quizzes and collect IDs by order
  const quizIds: number[] = [];
  for (const item of quizzes) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quizzes entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for quizzes entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for quizzes entry: ${JSON.stringify(item)}`
    );
    const quiz = await prisma.quiz.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        teacher_id: mappedTeacherId,
      },
    });
    quizIds.push(quiz.quiz_id);
  }

  // 41. Seed QuizMappings
  for (const item of quiz_mappings) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_mappings entry: ${JSON.stringify(item)}`
    );
    const mappedQuizId = ensureNumber(
      typeof item.quiz_id === 'number' && quizIds[item.quiz_id - 1] !== undefined ? quizIds[item.quiz_id - 1] : quizIds[0],
      `Invalid mappedQuizId for quiz_mappings entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for quiz_mappings entry: ${JSON.stringify(item)}`
    );
    await prisma.quizMapping.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_id: mappedQuizId,
        teacher_id: mappedTeacherId,
      },
    });
  }

  // 42. Seed QuizQuestions and collect IDs by order
  const quizQuestionIds: number[] = [];
  for (const item of quiz_questions) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_questions entry: ${JSON.stringify(item)}`
    );
    const mappedQuizId = ensureNumber(
      typeof item.quiz_id === 'number' && quizIds[item.quiz_id - 1] !== undefined ? quizIds[item.quiz_id - 1] : quizIds[0],
      `Invalid mappedQuizId for quiz_questions entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for quiz_questions entry: ${JSON.stringify(item)}`
    );
    const question = await prisma.quizQuestion.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_id: mappedQuizId,
        teacher_id: mappedTeacherId,
      },
    });
    quizQuestionIds.push(question.quiz_question_id);
  }

  // 43. Seed QuizQuestionOptions and collect IDs by order
  const quizQuestionOptionIds: number[] = [];
  for (const item of quiz_question_options) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_question_options entry: ${JSON.stringify(item)}`
    );
    const mappedQuizQuestionId = ensureNumber(
      typeof item.quiz_question_id === 'number' && quizQuestionIds[item.quiz_question_id - 1] !== undefined ? quizQuestionIds[item.quiz_question_id - 1] : quizQuestionIds[0],
      `Invalid mappedQuizQuestionId for quiz_question_options entry: ${JSON.stringify(item)}`
    );
    const option = await prisma.quizQuestionOption.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_question_id: mappedQuizQuestionId,
      },
    });
    quizQuestionOptionIds.push(option.quiz_question_option_id);
  }

  // 44. Seed QuizQuestionAnswers
  for (const item of quiz_question_answers) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_question_answers entry: ${JSON.stringify(item)}`
    );
    const mappedQuizQuestionId = ensureNumber(
      typeof item.quiz_question_id === 'number' && quizQuestionIds[item.quiz_question_id - 1] !== undefined ? quizQuestionIds[item.quiz_question_id - 1] : quizQuestionIds[0],
      `Invalid mappedQuizQuestionId for quiz_question_answers entry: ${JSON.stringify(item)}`
    );
    await prisma.quizQuestionAnswer.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_question_id: mappedQuizQuestionId,
      },
    });
  }

  // 45. Seed QuizAttempts and collect IDs by order
  const quizAttemptIds: number[] = [];
  for (const item of quiz_attempts) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_attempts entry: ${JSON.stringify(item)}`
    );
    const mappedQuizId = ensureNumber(
      typeof item.quiz_id === 'number' && quizIds[item.quiz_id - 1] !== undefined ? quizIds[item.quiz_id - 1] : quizIds[0],
      `Invalid mappedQuizId for quiz_attempts entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for quiz_attempts entry: ${JSON.stringify(item)}`
    );
    const mappedGradedBy = (item.graded_by != null && teacherIds[item.graded_by - 1] !== undefined
      ? teacherIds[item.graded_by - 1]
      : null) ?? null;
    const attempt = await prisma.quizAttempt.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_id: mappedQuizId,
        student_id: mappedStudentId,
        graded_by: mappedGradedBy,
      },
    });
    quizAttemptIds.push(attempt.quiz_attempt_id);
  }

  // 46. Seed QuizAttemptAnswers
  for (const item of quiz_attempt_answers) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for quiz_attempt_answers entry: ${JSON.stringify(item)}`
    );
    const mappedQuizAttemptId = ensureNumber(
      typeof item.quiz_attempt_id === 'number' && quizAttemptIds[item.quiz_attempt_id - 1] !== undefined ? quizAttemptIds[item.quiz_attempt_id - 1] : quizAttemptIds[0],
      `Invalid mappedQuizAttemptId for quiz_attempt_answers entry: ${JSON.stringify(item)}`
    );
    const mappedQuizQuestionId = ensureNumber(
      typeof item.quiz_question_id === 'number' && quizQuestionIds[item.quiz_question_id - 1] !== undefined ? quizQuestionIds[item.quiz_question_id - 1] : quizQuestionIds[0],
      `Invalid mappedQuizQuestionId for quiz_attempt_answers entry: ${JSON.stringify(item)}`
    );
    const mappedQuizQuestionOptionId = (typeof item.quiz_question_option_id === 'number' && quizQuestionOptionIds[item.quiz_question_option_id - 1] !== undefined
      ? quizQuestionOptionIds[item.quiz_question_option_id - 1]
      : null) ?? null;
    const mappedReviewedByTeacherId = (typeof item.reviewed_by_teacher_id === 'number' && teacherIds[item.reviewed_by_teacher_id - 1] !== undefined
      ? teacherIds[item.reviewed_by_teacher_id - 1]
      : null) ?? null;
    await prisma.quizAttemptAnswer.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        quiz_attempt_id: mappedQuizAttemptId,
        quiz_question_id: mappedQuizQuestionId,
        quiz_question_option_id: mappedQuizQuestionOptionId,
        reviewed_by_teacher_id: mappedReviewedByTeacherId,
      },
    });
  }

  // 47. Seed Assignments and collect IDs by order
  const assignmentIds: number[] = [];
  for (const item of assignments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignments entry: ${JSON.stringify(item)}`
    );
    const mappedCourseId = ensureNumber(
      typeof item.course_id === 'number' && courseIds[item.course_id - 1] !== undefined ? courseIds[item.course_id - 1] : courseIds[0],
      `Invalid mappedCourseId for assignments entry: ${JSON.stringify(item)}`
    );
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for assignments entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    const assignment = await prisma.assignment.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        course_id: mappedCourseId,
        teacher_id: mappedTeacherId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    assignmentIds.push(assignment.assignment_id);
  }

  // 48. Seed AssignmentMappings
  for (const item of assignmentMappings) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignmentMappings entry: ${JSON.stringify(item)}`
    );
    const mappedAssignmentId = ensureNumber(
      typeof item.assignment_id === 'number' && assignmentIds[item.assignment_id - 1] !== undefined ? assignmentIds[item.assignment_id - 1] : assignmentIds[0],
      `Invalid mappedAssignmentId for assignmentMappings entry: ${JSON.stringify(item)}`
    );
    let mappedReferenceId: number;
    if (item.reference_table_type === 'COURSE' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseIds[item.reference_id - 1] !== undefined ? courseIds[item.reference_id - 1] : courseIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else if (item.reference_table_type === 'COURSE_MODULE' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseModuleIds[item.reference_id - 1] !== undefined ? courseModuleIds[item.reference_id - 1] : courseModuleIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else if (item.reference_table_type === 'COURSE_TOPIC' && typeof item.reference_id === 'number') {
      mappedReferenceId = ensureNumber(
        courseTopicIds[item.reference_id - 1] !== undefined ? courseTopicIds[item.reference_id - 1] : courseTopicIds[0],
        `Invalid mappedReferenceId for assignmentMappings entry: ${JSON.stringify(item)}`
      );
    } else {
      mappedReferenceId = 1; // fallback, should never happen if data is correct
    }
    const mappedTeacherId = ensureNumber(
      typeof item.teacher_id === 'number' && teacherIds[item.teacher_id - 1] !== undefined ? teacherIds[item.teacher_id - 1] : teacherIds[0],
      `Invalid mappedTeacherId for assignmentMappings entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    await prisma.assignmentMapping.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        assignment_id: mappedAssignmentId,
        reference_id: mappedReferenceId,
        teacher_id: mappedTeacherId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }

  // 49. Seed StudentAssignments and collect IDs by order
  const studentAssignmentIds: number[] = [];
  for (const item of studentAssignments) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedAssignmentId = ensureNumber(
      typeof item.assignment_id === 'number' && assignmentIds[item.assignment_id - 1] !== undefined ? assignmentIds[item.assignment_id - 1] : assignmentIds[0],
      `Invalid mappedAssignmentId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedStudentId = ensureNumber(
      typeof item.student_id === 'number' && studentIds[item.student_id - 1] !== undefined ? studentIds[item.student_id - 1] : studentIds[0],
      `Invalid mappedStudentId for studentAssignments entry: ${JSON.stringify(item)}`
    );
    const mappedGradedBy = (item.graded_by != null && teacherIds[item.graded_by - 1] !== undefined
      ? teacherIds[item.graded_by - 1]
      : null) ?? null;
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    const studentAssignment = await prisma.studentAssignment.create({
      data: {
        ...item,
        tenant_id: mappedTenantId,
        assignment_id: mappedAssignmentId,
        student_id: mappedStudentId,
        graded_by: mappedGradedBy,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
    studentAssignmentIds.push(studentAssignment.student_assignment_id);
  }

  // 50. Seed AssignmentSubmissionFiles
  for (const item of assignmentSubmissionFiles) {
    const mappedTenantId = ensureNumber(
      typeof item.tenant_id === 'number' && tenantIds[item.tenant_id - 1] !== undefined ? tenantIds[item.tenant_id - 1] : tenantIds[0],
      `Invalid mappedTenantId for assignmentSubmissionFiles entry: ${JSON.stringify(item)}`
    );
    const mappedStudentAssignmentId = ensureNumber(
      typeof item.student_assignment_id === 'number' && studentAssignmentIds[item.student_assignment_id - 1] !== undefined ? studentAssignmentIds[item.student_assignment_id - 1] : studentAssignmentIds[0],
      `Invalid mappedStudentAssignmentId for assignmentSubmissionFiles entry: ${JSON.stringify(item)}`
    );
    let mappedCreatedBy: number = (item.created_by != null && usernameToId[item.created_by] !== undefined && usernameToId[item.created_by] != null)
      ? usernameToId[item.created_by]!
      : bootstrapUser.system_user_id;
    let mappedUpdatedBy: number | null = (item.updated_by != null && usernameToId[item.updated_by] !== undefined && usernameToId[item.updated_by] != null)
      ? usernameToId[item.updated_by]!
      : (item.updated_by != null ? bootstrapUser.system_user_id : null);
    let mappedDeletedBy: number | null = (item.deleted_by != null && usernameToId[item.deleted_by] !== undefined && usernameToId[item.deleted_by] != null)
      ? usernameToId[item.deleted_by]!
      : (item.deleted_by != null ? bootstrapUser.system_user_id : null);
    // Remove uploaded_at property if present, as it is not in the Prisma schema
    const { uploaded_at, ...rest } = item;
    await prisma.assignmentSubmissionFile.create({
      data: {
        ...rest,
        tenant_id: mappedTenantId,
        student_assignment_id: mappedStudentAssignmentId,
        created_by: mappedCreatedBy,
        updated_by: mappedUpdatedBy,
        deleted_by: mappedDeletedBy,
      },
    });
  }
}

main()
  .then(() => {
    console.log('Seeding completed successfully!');
  })
  .catch((e) => {
    console.error('Seeding failed with error:', e);
    // if (e && e.stack) {
    //   console.error('Stack trace:', e.stack);
    // }
    process.exit(1);
  });