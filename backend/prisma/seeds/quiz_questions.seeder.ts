import { PrismaClient } from '@prisma/client';
import { quiz_questions } from '../seed-data/quiz_questions';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizQuestions(
  prisma: PrismaClient,
  tenantIds: number[],
  quizIds: number[],
  teacherIds: number[]
): Promise<number[]> {
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
  console.log('Seeded quiz questions');
  return quizQuestionIds;
}
