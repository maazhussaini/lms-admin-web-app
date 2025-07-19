import { PrismaClient } from '@prisma/client';
import { quizzes } from '../seed-data/quizzes';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizzes(
  prisma: PrismaClient,
  tenantIds: number[],
  courseIds: number[],
  teacherIds: number[]
): Promise<number[]> {
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
  console.log('Seeded quizzes');
  return quizIds;
}
