import { PrismaClient } from '@prisma/client';
import { quiz_attempt_answers } from '../seed-data/quiz_attempt_answers';
import { ensureNumber } from './utils/ensureNumber';

export async function seedQuizAttemptAnswers(
  prisma: PrismaClient,
  tenantIds: number[],
  quizAttemptIds: number[],
  quizQuestionIds: number[],
  quizQuestionOptionIds: number[],
  teacherIds: number[]
) {
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
  console.log('Seeded quiz attempt answers');
}
