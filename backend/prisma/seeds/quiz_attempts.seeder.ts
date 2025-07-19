import { PrismaClient } from '@prisma/client';
import { quiz_attempts } from '../seed-data/quiz_attempts';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizAttempts(
  prisma: PrismaClient,
  tenantIds: number[],
  quizIds: number[],
  studentIds: number[],
  teacherIds: number[]
): Promise<number[]> {
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
  console.log('Seeded quiz attempts');
  return quizAttemptIds;
}
