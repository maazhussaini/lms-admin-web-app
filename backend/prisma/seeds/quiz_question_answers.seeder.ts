import { PrismaClient } from '@prisma/client';
import { quiz_question_answers } from '../seed-data/quiz_question_answers';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizQuestionAnswers(
  prisma: PrismaClient,
  tenantIds: number[],
  quizQuestionIds: number[]
) {
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
  console.log('Seeded quiz question answers');
}
