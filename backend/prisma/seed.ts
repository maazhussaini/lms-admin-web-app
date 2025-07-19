// Reset option: set RESET_DB=true in .env or environment to clear tables before seeding
async function resetDatabase(prisma: PrismaClient) {
  // Nullify audit fields for system users and roles to break circular FK constraints
  await prisma.systemUser.updateMany({ data: { created_by: null, updated_by: null, deleted_by: null } });
  await prisma.role.updateMany({ data: { created_by: null, updated_by: null, deleted_by: null } });
  console.log('Resetting database...');
  // Delete in reverse dependency order for safety
  await prisma.assignmentSubmissionFile.deleteMany();
  await prisma.studentAssignment.deleteMany();
  await prisma.assignmentMapping.deleteMany();
  await prisma.assignment.deleteMany();
  await prisma.quizAttemptAnswer.deleteMany();
  await prisma.quizAttempt.deleteMany();
  await prisma.quizQuestionAnswer.deleteMany();
  await prisma.quizQuestionOption.deleteMany();
  await prisma.quizQuestion.deleteMany();
  await prisma.quizMapping.deleteMany();
  await prisma.quiz.deleteMany();
  await prisma.videoProgress.deleteMany();
  await prisma.courseSessionSettings.deleteMany();
  await prisma.courseSessionEnrollment.deleteMany();
  await prisma.courseSession.deleteMany();
  await prisma.teacherCourse.deleteMany();
  await prisma.studentCourseProgress.deleteMany();
  await prisma.enrollmentStatusHistory.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.courseDocument.deleteMany();
  await prisma.courseVideo.deleteMany();
  await prisma.courseTopic.deleteMany();
  await prisma.courseModule.deleteMany();
  await prisma.courseSpecialization.deleteMany();
  await prisma.course.deleteMany();
  await prisma.teacherPhoneNumber.deleteMany();
  await prisma.teacherEmailAddress.deleteMany();
  await prisma.teacher.deleteMany();
  await prisma.studentInstitute.deleteMany();
  await prisma.studentDevice.deleteMany();
  await prisma.studentPhoneNumber.deleteMany();
  await prisma.studentEmailAddress.deleteMany();
  await prisma.student.deleteMany();
  await prisma.specializationProgram.deleteMany();
  await prisma.institute.deleteMany();
  await prisma.specialization.deleteMany();
  await prisma.program.deleteMany();
  await prisma.city.deleteMany();
  await prisma.state.deleteMany();
  await prisma.country.deleteMany();
  await prisma.clientTenant.deleteMany();
  await prisma.tenantEmailAddress.deleteMany();
  await prisma.tenantPhoneNumber.deleteMany();
  await prisma.client.deleteMany();
  await prisma.roleScreen.deleteMany();
  await prisma.userScreen.deleteMany();
  await prisma.screen.deleteMany();
  // ...existing code...
  // ...existing code...
  // Delete all system users except bootstrap user
  await prisma.systemUser.deleteMany({ where: { username: { not: 'bootstrap_admin' } } });
  // Delete all tenants
  await prisma.tenant.deleteMany();
  // Delete bootstrap system user
  await prisma.systemUser.deleteMany({ where: { username: 'bootstrap_admin' } });
  // Delete all roles
  await prisma.role.deleteMany();
  console.log('Database reset complete.');
}
import { config } from 'dotenv';
config({ path: '../backend/.env' });
import { env } from '../src/config/environment';
import { PrismaClient } from '@prisma/client';
import * as seedData from './seed-data/index';
const {
  roles,
  system_users,
} = seedData;
import { seedStudentInstitutes } from './seeds/student_institutes.seeder';
import { seedStudentDevices } from './seeds/student_devices.seeder';
import { seedStudentPhoneNumbers } from './seeds/student_phone_numbers.seeder';
import { seedStudentEmailAddresses } from './seeds/student_email_addresses.seeder';
import { seedStudents } from './seeds/students.seeder';
import { seedSpecializationPrograms } from './seeds/specialization_programs.seeder';
import { seedRoles } from './seeds/roles.seeder';
import { seedScreens } from './seeds/screens.seeder';
import { seedUserScreens } from './seeds/user_screens.seeder';
import { seedTenants } from './seeds/tenants.seeder';
import { seedSystemUsers } from './seeds/system_users.seeder';
import { seedRoleScreens } from './seeds/role_screens.seeder';
import { seedClientTenants } from './seeds/client_tenants.seeder';
import { seedCountries } from './seeds/countries.seeder';
import { seedStates } from './seeds/states.seeder';
import { seedCities } from './seeds/cities.seeder';
import { seedPrograms } from './seeds/programs.seeder';
import { seedSpecializations } from './seeds/specializations.seeder';
import { seedInstitutes } from './seeds/institutes.seeder';
import { seedTenantPhoneNumbers } from './seeds/tenant_phone_numbers.seeder';
import { seedTenantEmailAddresses } from './seeds/tenant_email_addresses.seeder';
import { seedClients } from './seeds/clients.seeder';
import { seedTeachers } from './seeds/teachers.seeder';
import { seedTeacherEmailAddresses } from './seeds/teacher_email_addresses.seeder';
import { seedTeacherPhoneNumbers } from './seeds/teacher_phone_numbers.seeder';
import { seedCourses } from './seeds/courses.seeder';
import { seedCourseSpecializations } from './seeds/course_specializations.seeder';
import { seedCourseModules } from './seeds/course_modules.seeder';
import { seedCourseTopics } from './seeds/course_topics.seeder';
import { seedCourseVideos } from './seeds/course_videos.seeder';
import { seedCourseDocuments } from './seeds/course_documents.seeder';
import { seedEnrollments } from './seeds/enrollments.seeder';
import { seedEnrollmentStatusHistories } from './seeds/enrollment_status_histories.seeder';
import { seedStudentCourseProgresses } from './seeds/student_course_progresses.seeder';
import { seedTeacherCourses } from './seeds/teacher_courses.seeder';
import { seedCourseSessions } from './seeds/course_sessions.seeder';
import { seedCourseSessionEnrollments } from './seeds/course_session_enrollments.seeder';
import { seedCourseSessionSettings } from './seeds/course_session_settings.seeder';
import { seedVideoProgresses } from './seeds/video_progresses.seeder';
import { seedQuizMappings } from './seeds/quiz_mappings.seeder';
import { seedQuizQuestions } from './seeds/quiz_questions.seeder';
import { seedQuizQuestionOptions } from './seeds/quiz_question_options.seeder';
import { seedQuizQuestionAnswers } from './seeds/quiz_question_answers.seeder';
import { seedQuizAttempts } from './seeds/quiz_attempts.seeder';
import { seedQuizAttemptAnswers } from './seeds/quiz_attempt_answers.seeder';
import { seedAssignments } from './seeds/assignments.seeder';
import { seedAssignmentMappings } from './seeds/assignment_mappings.seeder';
import { seedStudentAssignments } from './seeds/student_assignments.seeder';
import { seedAssignmentSubmissionFiles } from './seeds/assignment_submission_files.seeder';
import { seedQuizzes } from './seeds/quizzes.seeder';

const prisma = new PrismaClient();

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

  if (process.env.RESET_DB === 'true') {
    await resetDatabase(prisma);
  }

  console.log('Starting modular Prisma seeding...');

  // 1. Modular roles seeding FIRST (audit fields null)
  await seedRoles(prisma, null);

  // 2. Bootstrap system user (after roles exist)
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

  // 3. Modular tenants seeding
  await seedTenants(prisma, bootstrapUser.system_user_id);

  // Build tenant IDs by order (after tenants are seeded)
  const tenantIds: number[] = [];
  const allTenants = await prisma.tenant.findMany({ orderBy: { tenant_id: 'asc' } });
  for (const t of allTenants) {
    tenantIds.push(t.tenant_id);
  }

  // Modular system users seeding
  await seedSystemUsers(prisma, tenantIds, bootstrapUser.system_user_id);

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

  // Modular screens seeding
  const screenIds = await seedScreens(prisma, usernameToId, bootstrapUser.system_user_id);

  // Modular user screens seeding
  await seedUserScreens(prisma, tenantIds, allUsers, screenIds, usernameToId, bootstrapUser.system_user_id);

  // 39. Modular role_screens seeding
  await seedRoleScreens(prisma, tenantIds, screenIds, usernameToId, bootstrapUser.system_user_id);

  // 7. Modular clients seeding
  const clientIds = await seedClients(prisma, tenantIds, auditMaps, bootstrapUser.system_user_id);

  // 8. Modular tenant_phone_numbers seeding
  await seedTenantPhoneNumbers(prisma, tenantIds, usernameToId, bootstrapUser.system_user_id);

  // 9. Modular tenant_email_addresses seeding
  await seedTenantEmailAddresses(prisma, tenantIds, usernameToId, bootstrapUser.system_user_id);

  // 10. Modular client_tenants seeding
  await seedClientTenants(prisma, clientIds, tenantIds, bootstrapUser.system_user_id);

  // 12. Modular countries seeding
  const countryIds = await seedCountries(prisma, auditMaps, bootstrapUser.system_user_id);

  // 13. Modular states seeding
  const stateIds = await seedStates(prisma, countryIds, auditMaps, bootstrapUser.system_user_id);

  // 14. Modular cities seeding
  const cityIds = await seedCities(prisma, stateIds, auditMaps, bootstrapUser.system_user_id);
  
  // Fetch all created cities for mapping
  const allCities = await prisma.city.findMany({ orderBy: { city_id: 'asc' } });

  // 15. Modular programs seeding
  const programIds = await seedPrograms(prisma, tenantIds, auditMaps, bootstrapUser.system_user_id);

  // 16. Modular specializations seeding
  const specializationIds = await seedSpecializations(prisma, tenantIds, programIds, auditMaps, bootstrapUser.system_user_id);

  // 17. Modular institutes seeding
  const instituteIds = await seedInstitutes(prisma, tenantIds, auditMaps, bootstrapUser.system_user_id);
  
  // 17a. Modular specialization_programs seeding
  const specializationProgramIds = await seedSpecializationPrograms(
    prisma,
    specializationIds,
    programIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 18. Modular students seeding
  const studentIds = await seedStudents(
    prisma,
    tenantIds,
    countryIds,
    stateIds,
    allCities,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 19. Modular student_email_addresses seeding
  await seedStudentEmailAddresses(
    prisma,
    tenantIds,
    studentIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 20. Modular student_phone_numbers seeding
  await seedStudentPhoneNumbers(
    prisma,
    tenantIds,
    studentIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 21. Modular student_devices seeding
  await seedStudentDevices(
    prisma,
    tenantIds,
    studentIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 22. Modular student_institutes seeding
  await seedStudentInstitutes(
    prisma,
    tenantIds,
    studentIds,
    instituteIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 23. Modular teachers seeding
  const teacherIds = await seedTeachers(
    prisma,
    tenantIds,
    countryIds,
    stateIds,
    allCities,
    auditMaps,
    bootstrapUser.system_user_id
  );
  // 24. Modular teacher_email_addresses seeding
  await seedTeacherEmailAddresses(
    prisma,
    tenantIds,
    teacherIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 25. Modular teacher_phone_numbers seeding
  await seedTeacherPhoneNumbers(
    prisma,
    tenantIds,
    teacherIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 26. Modular courses seeding
  const courseIds = await seedCourses(
    prisma,
    tenantIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 27. Modular course_specializations seeding
  await seedCourseSpecializations(
    prisma,
    courseIds,
    specializationIds,
    auditMaps
  );

  // 28. Modular course_modules seeding
  const courseModuleIds = await seedCourseModules(
    prisma,
    tenantIds,
    courseIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 29. Modular course_topics seeding
  const courseTopicIds = await seedCourseTopics(
    prisma,
    tenantIds,
    courseModuleIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 30. Modular course_videos seeding
  const courseVideoIds = await seedCourseVideos(
    prisma,
    tenantIds,
    courseIds,
    courseTopicIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 31. Modular course_documents seeding
  await seedCourseDocuments(
    prisma,
    tenantIds,
    courseIds,
    courseTopicIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 32. Modular enrollments seeding
  const enrollmentIds = await seedEnrollments(
    prisma,
    tenantIds,
    courseIds,
    studentIds,
    instituteIds,
    teacherIds,
    specializationProgramIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 33. Modular enrollment_status_histories seeding
  await seedEnrollmentStatusHistories(
    prisma,
    tenantIds,
    enrollmentIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 34. Modular student_course_progresses seeding
  await seedStudentCourseProgresses(
    prisma,
    tenantIds,
    studentIds,
    courseIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 35. Modular teacher_courses seeding
  await seedTeacherCourses(
    prisma,
    tenantIds,
    courseIds,
    teacherIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 36. Modular course_sessions seeding and collect IDs by order
  const courseSessionIds: number[] = await seedCourseSessions(
    prisma,
    tenantIds,
    courseIds,
    teacherIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 37. Modular course_session_enrollments seeding
  await seedCourseSessionEnrollments(
    prisma,
    tenantIds,
    courseSessionIds,
    studentIds,
    enrollmentIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 38. Modular course_session_settings seeding
  await seedCourseSessionSettings(
    prisma,
    tenantIds,
    courseSessionIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 39. Modular video_progresses seeding
  await seedVideoProgresses(
    prisma,
    tenantIds,
    studentIds,
    courseVideoIds,
    auditMaps,
    bootstrapUser.system_user_id
  );

  // 40. Modular quizzes seeding
  const quizIds: number[] = await seedQuizzes(prisma, tenantIds, courseIds, teacherIds);

  // 41. Modular quiz_mappings seeding
  await seedQuizMappings(prisma, tenantIds, quizIds, teacherIds);

  // 42. Modular quiz_questions seeding
  const quizQuestionIds: number[] = await seedQuizQuestions(prisma, tenantIds, quizIds, teacherIds);

  // 43. Modular quiz_question_options seeding
  const quizQuestionOptionIds: number[] = await seedQuizQuestionOptions(prisma, tenantIds, quizQuestionIds);

  // 44. Modular quiz_question_answers seeding
  await seedQuizQuestionAnswers(prisma, tenantIds, quizQuestionIds);

  // 45. Modular quiz_attempts seeding
  const quizAttemptIds: number[] = await seedQuizAttempts(prisma, tenantIds, quizIds, studentIds, teacherIds);

  // 46. Modular quiz_attempt_answers seeding
  await seedQuizAttemptAnswers(prisma, tenantIds, quizAttemptIds, quizQuestionIds, quizQuestionOptionIds, teacherIds);

  // 47. Modular assignments seeding
  const assignmentIds: number[] = await seedAssignments(prisma, tenantIds, courseIds, teacherIds, usernameToId, bootstrapUser.system_user_id);

  // 48. Modular assignment_mappings seeding
  await seedAssignmentMappings(prisma, tenantIds, assignmentIds, courseIds, courseModuleIds, courseTopicIds, teacherIds, usernameToId, bootstrapUser.system_user_id);

  // 49. Modular student_assignments seeding
  const studentAssignmentIds: number[] = await seedStudentAssignments(prisma, tenantIds, assignmentIds, studentIds, teacherIds, usernameToId, bootstrapUser.system_user_id);

  // 50. Modular assignment_submission_files seeding
  await seedAssignmentSubmissionFiles(prisma, tenantIds, studentAssignmentIds, usernameToId, bootstrapUser.system_user_id);
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