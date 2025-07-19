import { PrismaClient } from '@prisma/client';
import { quiz_question_options } from '../seed-data/quiz_question_options';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizQuestionOptions(
  prisma: PrismaClient,
  tenantIds: number[],
  quizQuestionIds: number[]
): Promise<number[]> {
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
  console.log('Seeded quiz question options');
  return quizQuestionOptionIds;
}
