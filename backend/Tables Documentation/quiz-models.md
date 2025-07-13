# Quiz Models Table Documentation

## Quiz
- quiz_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- course_id Int, not null
- teacher_id Int, not null
- quiz_name String, not null
- quiz_description String, nullable
- total_marks Decimal(6,2), not null
- passing_marks Decimal(6,2), nullable
- time_limit_minutes Int, nullable
- max_attempts Int, nullable
- allow_retake Boolean, default false, not null
- randomize_questions Boolean, default false, not null
- due_date DateTime, nullable
- status QuizStatus, default DRAFT, not null [DRAFT, PUBLISHED, GRADING_IN_PROGRESS, GRADED, ARCHIVED]
- instructions String, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizMapping
- quiz_mapping_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_id Int, not null
- reference_table_type QuizReferenceTable, not null [COURSE, COURSE_MODULE, COURSE_TOPIC]
- reference_id Int, not null
- teacher_id Int, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizQuestion
- quiz_question_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_id Int, not null
- teacher_id Int, not null
- question_text String, not null
- question_type QuizQuestionType, not null [MULTIPLE_CHOICE_SINGLE_ANSWER, MULTIPLE_CHOICE_MULTIPLE_ANSWERS, TRUE_FALSE, SHORT_ANSWER_ESSAY]
- question_marks Decimal(6,2), not null
- position Int, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizQuestionOption
- quiz_question_option_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_question_id Int, not null
- option_text String, not null
- position Int, not null
- is_correct Boolean, default false, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizQuestionAnswer
- quiz_question_answer_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_question_id Int, not null
- answer_text String, not null
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizAttempt
- quiz_attempt_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_id Int, not null
- student_id Int, not null
- attempt_number Int, not null
- started_at DateTime, not null
- submitted_at DateTime, nullable
- score Decimal(6,2), nullable
- percentage Decimal(5,2), nullable
- status QuizAttemptStatus, not null [NOT_STARTED, IN_PROGRESS, SUBMITTED, GRADED]
- time_taken_minutes Int, nullable
- graded_by Int, nullable
- graded_at DateTime, nullable
- teacher_notes String, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable

## QuizAttemptAnswer
- quiz_attempt_answer_id Int, [PK, autoincrement], not null
- tenant_id Int, not null
- quiz_attempt_id Int, not null
- quiz_question_id Int, not null
- quiz_question_option_id Int, nullable
- answer_text String, nullable
- is_correct Boolean, nullable
- marks_obtained Decimal(6,2), nullable
- reviewed_by_teacher_id Int, nullable
- teacher_comment String, nullable
- is_active Boolean, default true, not null
- is_deleted Boolean, default false, not null
- created_at DateTime, default now(), not null
- updated_at DateTime, default now(), not null
- created_by Int, not null
- updated_by Int, nullable
- deleted_at DateTime, nullable
- deleted_by Int, nullable
- created_ip String, nullable
- updated_ip String, nullable
