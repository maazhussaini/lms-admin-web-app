# PostgreSQL Functions to API Conversion Guide

This document outlines the process of converting PostgreSQL functions into Prisma queries and integrating them into the backend system. Each PostgreSQL function will be processed one by one, and for each function, the following steps will be performed:

## Steps for Each PostgreSQL Function

note: naming convention cases you must follow according to current system standards.

1. **Read the PostgreSQL Function**  
   - Open the PostgreSQL function from the provided file.
   - Understand its purpose, input parameters, and output structure.

2. **Convert SQL Queries to Prisma Queries**  
   - Rewrite the SQL logic in the PostgreSQL function using Prisma ORM queries.
   - Ensure the Prisma queries maintain the same functionality as the original SQL.

3. **Create API Components**  
   For each PostgreSQL function, the following components need to work:

   ### a. **Route**
   - Define a new route in the appropriate route file under `backend/src/api/v1/routes/`.
   - Ensure the route follows RESTful API conventions.

   ### b. **Controller**
   - Add a corresponding controller method in the relevant controller file under `backend/src/api/v1/controllers/`.
   - The controller will handle the request, validate inputs, and call the service layer.

   ### c. **Service**
   - Implement the business logic in the service layer under `backend/src/services/`.
   - Use Prisma queries to interact with the database and replicate the functionality of the PostgreSQL function.

4. **Integrate and Test**
   - Integrate the route, controller, and service into the backend system.
   - Test the API endpoint to ensure it works as expected and matches the behavior of the original PostgreSQL function.

## Complete Workflow

**PostgreSQL Function**  
   
CREATE OR REPLACE FUNCTION get_courses_by_programs_and_specialization(
    p_course_type VARCHAR DEFAULT NULL,
    p_program_id INT DEFAULT -1,
    p_specialization_id INT DEFAULT -1,
    p_search_query VARCHAR DEFAULT '',
    p_student_id INT DEFAULT 1
)
RETURNS TABLE (
    course_id INT,
    course_name TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    program_name TEXT,
    teacher_name TEXT,
    course_total_hours NUMERIC,
    profile_picture_url TEXT,
    teacher_qualification TEXT,
    program_id INT,
    purchase_status TEXT
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_tenant_id INT;
BEGIN
    SELECT s.tenant_id INTO v_tenant_id
    FROM students s
    WHERE s.student_id = p_student_id
      AND s.is_active = TRUE
      AND s.is_deleted = FALSE
    LIMIT 1;

    RETURN QUERY
    SELECT DISTINCT
        c.course_id::INT,
        c.course_name::TEXT,
        cs.start_date::TIMESTAMP,
        cs.end_date::TIMESTAMP,
        p.program_name::TEXT,
        t.full_name::TEXT,
        c.course_total_hours::NUMERIC,
        t.profile_picture_url::TEXT,
        t.teacher_qualification::TEXT,
        p.program_id::INT,
        CASE
            WHEN e.student_id IS NULL AND COALESCE(c.course_price, 0.00) = 0.00 THEN 'Free'
            WHEN e.student_id IS NULL AND c.course_price > 0.00 THEN CONCAT('Buy: $', c.course_price)
            WHEN e.student_id IS NOT NULL THEN 'Purchased'
            ELSE 'N/A'
        END::TEXT AS purchase_status
    FROM courses c
        LEFT JOIN enrollments e ON c.course_id = e.course_id
            AND e.student_id = p_student_id AND e.is_active = TRUE AND e.is_deleted = FALSE
        LEFT JOIN course_sessions cs ON cs.course_id = c.course_id
            AND cs.is_active = TRUE AND cs.is_deleted = FALSE
        INNER JOIN teacher_courses tc ON c.course_id = tc.course_id
        INNER JOIN teachers t ON tc.teacher_id = t.teacher_id
        INNER JOIN course_specializations csp ON csp.course_id = c.course_id AND csp.is_active = TRUE AND csp.is_deleted = FALSE
        INNER JOIN specialization_programs cp ON cp.specialization_id = csp.specialization_id AND cp.is_active = TRUE AND cp.is_deleted = FALSE
        LEFT JOIN specializations s1 ON s1.specialization_id = csp.specialization_id AND s1.is_active = TRUE AND s1.is_deleted = FALSE
        LEFT JOIN programs p ON cp.program_id = p.program_id AND p.is_active = TRUE AND p.is_deleted = FALSE
    WHERE
        c.is_active = TRUE
        AND c.is_deleted = FALSE
        AND c.course_status = 'PUBLIC'
        AND c.tenant_id = v_tenant_id
        AND (
            (s1.specialization_id = p_specialization_id OR p_specialization_id = -1) AND
            (p.program_id = p_program_id OR p_program_id = -1)
            )
        AND (
            c.course_name ILIKE '%' || p_search_query || '%'
            OR p_search_query = ''
        )
        AND (
            p_course_type IS NULL
            OR (p_course_type = 'PURCHASED' AND e.course_enrollment_type IN ('PAID_COURSE','FREE_COURSE','COURSE_SESSION'))
            OR (c.course_type = p_course_type::"CourseType" AND p_course_type <> 'PURCHASED')
        );
END;
$func$;


**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`



**PostgreSQL Function**  

CREATE OR REPLACE FUNCTION get_active_specializations_by_program(
    p_program_id INT DEFAULT 2,
    p_tenant_id INT DEFAULT 2
)
RETURNS TABLE (
    specialization_id INT,
    program_id INT,
    specialization_name TEXT,
    specialization_thumbnail_url TEXT
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        s.specialization_id::INT,
        sp.program_id::INT,
        s.specialization_name::TEXT,
        s.specialization_thumbnail_url::TEXT
    FROM
        public.specializations s
        INNER JOIN public.specialization_programs sp ON sp.specialization_id = s.specialization_id AND sp.is_active = TRUE AND sp.is_deleted = FALSE
    WHERE
        sp.program_id = p_program_id
        AND s.is_active = TRUE
        AND s.is_deleted = FALSE
        AND s.tenant_id = p_tenant_id
    ORDER BY
        s.specialization_name;
END;
$func$;   


**Route**  
   Add a route in `specialization.routes.ts`

**controller**  
   Add a controller in `specialization.controller.ts`

**service**  
   Add a service in `specialization.service.ts`


**PostgreSQL Function**  

CREATE OR REPLACE FUNCTION get_enrolled_courses_by_student_id(
    p_student_id INT DEFAULT 1,
    p_search_query VARCHAR DEFAULT ''
)
RETURNS TABLE (
    enrollment_id INT,
    specialization_program_id INT,
    course_id INT,
    specialization_id INT,
    program_id INT,
    course_name TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    specialization_name TEXT,
    program_name TEXT,
    teacher_name TEXT,
    course_total_hours NUMERIC,
    overall_progress_percentage NUMERIC
)
LANGUAGE plpgsql
AS $func$
DECLARE
    v_tenant_id INT;
BEGIN
    SELECT s.tenant_id INTO v_tenant_id
    FROM students s
    WHERE s.student_id = p_student_id
      AND s.is_active = TRUE
      AND s.is_deleted = FALSE
    LIMIT 1;

    RETURN QUERY
    SELECT DISTINCT
        e.enrollment_id::INT,
        cp.specialization_program_id::INT,
        c.course_id::INT,
        cp.specialization_id::INT,
        cp.program_id::INT,
        c.course_name::TEXT,
        cs.start_date::TIMESTAMP,
        cs.end_date::TIMESTAMP,
        s1.specialization_name::TEXT,
        p.program_name::TEXT,
        t.full_name::TEXT,
        c.course_total_hours::NUMERIC,
        scp.overall_progress_percentage::NUMERIC
    FROM
        public.courses c
        INNER JOIN public.enrollments e ON c.course_id = e.course_id
            AND e.student_id = p_student_id
            AND e.is_active = TRUE
            AND e.is_deleted = FALSE
        LEFT JOIN course_sessions cs ON cs.course_id = c.course_id
            AND cs.is_active = TRUE AND cs.is_deleted = FALSE
        INNER JOIN public.student_course_progresses scp ON scp.course_id = c.course_id
            AND scp.student_id = e.student_id AND scp.is_active = TRUE AND scp.is_deleted = FALSE
        INNER JOIN public.teacher_courses tc ON c.course_id = tc.course_id
            AND tc.is_active = TRUE AND tc.is_deleted = FALSE
        INNER JOIN public.teachers t ON tc.teacher_id = t.teacher_id
        INNER JOIN public.course_specializations csp ON csp.course_id = c.course_id AND csp.is_active = TRUE AND csp.is_deleted = FALSE
        INNER JOIN public.specialization_programs cp ON cp.specialization_program_id = e.specialization_program_id AND cp.is_active = TRUE AND cp.is_deleted = FALSE
        LEFT JOIN public.specializations s1 ON s1.specialization_id = cp.specialization_id AND s1.is_active = TRUE AND s1.is_deleted = FALSE
        LEFT JOIN public.programs p ON cp.program_id = p.program_id AND p.is_active = TRUE AND p.is_deleted = FALSE
    WHERE
        c.is_active = TRUE
        AND c.is_deleted = FALSE
        AND c.course_status = 'PUBLIC'
        AND c.tenant_id = v_tenant_id
        AND (
            c.course_name ILIKE '%' || p_search_query || '%'
            OR p_search_query = ''
        );
END;
$func$;   


**Route**  
   Add a route in `student.routes.ts`

**controller**  
   Add a controller in `student.controller.ts`

**service**  
   Add a service in `student.service.ts`


**PostgreSQL Function**     

CREATE OR REPLACE FUNCTION get_course_basic_details(
    p_student_id INT DEFAULT 0,
    p_course_id INT DEFAULT 0
)
RETURNS TABLE (
    course_id INT,
    course_name TEXT,
    course_description TEXT,
    overall_progress_percentage NUMERIC,
    teacher_name TEXT,
    start_date TIMESTAMP,
    end_date TIMESTAMP,
    purchase_status "CourseType",
    program_name TEXT,
    specialization_name TEXT
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        c.course_id::INT,
        c.course_name::TEXT,
        c.course_description::TEXT,
        scp.overall_progress_percentage::NUMERIC,
        t.full_name::TEXT,
        cs.start_date::TIMESTAMP,
        cs.end_date::TIMESTAMP,
        CASE
            WHEN e.course_id IS NULL THEN c.course_type
            ELSE 'PURCHASED'::"CourseType"
        END AS purchase_status,
        p.program_name::TEXT,
        s.specialization_name::TEXT
    FROM
        public.courses c
        LEFT JOIN public.enrollments e ON c.course_id = e.course_id
            AND e.student_id = p_student_id
            AND e.is_active = TRUE
            AND e.is_deleted = FALSE
        LEFT JOIN public.course_sessions cs ON cs.course_id = c.course_id
            AND cs.is_active = TRUE AND cs.is_deleted = FALSE
        LEFT JOIN public.student_course_progresses scp ON scp.course_id = c.course_id
            AND scp.student_id = p_student_id
            AND scp.is_active = TRUE
            AND scp.is_deleted = FALSE
        INNER JOIN public.teacher_courses tc ON tc.course_id = c.course_id
            AND tc.is_active = TRUE
            AND tc.is_deleted = FALSE
        LEFT JOIN public.teachers t ON tc.teacher_id = t.teacher_id
            AND t.is_active = TRUE
            AND t.is_deleted = FALSE
        LEFT JOIN public.specialization_programs sp ON sp.specialization_program_id = e.specialization_program_id AND sp.is_active = TRUE AND sp.is_deleted = FALSE
        LEFT JOIN public.specializations s ON s.specialization_id = sp.specialization_id AND s.is_active = TRUE AND s.is_deleted = FALSE
        LEFT JOIN public.programs p ON p.program_id = sp.program_id AND p.is_active = TRUE AND p.is_deleted = FALSE
    WHERE
        c.is_active = TRUE
        AND c.is_deleted = FALSE
        AND c.course_id = p_course_id
    LIMIT 1;
END;
$func$;


**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`


**PostgreSQL Function**   

   CREATE OR REPLACE FUNCTION get_course_modules(
    p_course_id INT DEFAULT 0
)
RETURNS TABLE (
    course_module_id INT,
    course_module_name TEXT,
    module_stats TEXT
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        cm.course_module_id::INT,
        cm.course_module_name::TEXT,
        CONCAT (
            (
                SELECT
                    COUNT(ct.course_topic_id)
                FROM
                    public.course_topics ct
                WHERE
                    ct.is_active = TRUE
                    AND ct.is_deleted = FALSE
                    AND ct.module_id = cm.course_module_id
            ),
            ' Topics  |  ',
            (
                SELECT
                    COUNT(cv.course_video_id)
                FROM
                    public.course_topics ct
                    INNER JOIN public.course_videos cv ON ct.course_topic_id = cv.course_topic_id
                    AND cv.is_active = TRUE
                    AND cv.is_deleted = FALSE
                WHERE
                    ct.is_active = TRUE
                    AND ct.is_deleted = FALSE
                    AND ct.module_id = cm.course_module_id
            ),
            ' Video Lectures'
        )::TEXT AS module_stats
    FROM
        public.course_modules cm
    WHERE
        cm.course_id = p_course_id
        AND cm.is_active = TRUE
        AND cm.is_deleted = FALSE
    ORDER BY
        cm."position" ASC;
END;
$func$;



**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`


**PostgreSQL Function**   

CREATE OR REPLACE FUNCTION get_course_topics_by_module_id(
    p_module_id INT DEFAULT 0
)
RETURNS TABLE (
    course_topic_id INT,
    course_topic_name TEXT,
    overall_video_lectures TEXT
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        ct.course_topic_id::INT,
        ct.course_topic_name::TEXT,
        (
            SELECT
                CONCAT (COUNT(cv.course_video_id), ' Video Lectures')
            FROM
                public.course_videos cv
            WHERE
                cv.course_topic_id = ct.course_topic_id
                AND cv.is_active = TRUE
                AND cv.is_deleted = FALSE
        )::TEXT AS overall_video_lectures
    FROM
        public.course_topics ct
    WHERE
        ct.module_id = p_module_id
        AND ct.is_active = TRUE
        AND ct.is_deleted = FALSE
    ORDER BY
        ct."position" ASC;
END;
$func$;


**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`


**PostgreSQL Function**      

CREATE OR REPLACE FUNCTION get_all_course_videos_by_topic_id(
    p_course_topic_id INT DEFAULT 0,
    p_student_id INT DEFAULT 0
)
RETURNS TABLE (
    course_video_id INT,
    "position" INT,
    video_name TEXT,
    duration_seconds INT,
    is_completed BOOLEAN,
    completion_percentage NUMERIC,
    last_watched_at TIMESTAMP,
    completion_status TEXT,
    is_video_locked BOOLEAN
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        cv.course_video_id::INT,
        cv.position::INT,
        cv.video_name::TEXT,
        cv.duration_seconds::INT,
        vp.is_completed::BOOLEAN,
        vp.completion_percentage::NUMERIC,
        vp.last_watched_at::TIMESTAMP,
        CASE
            WHEN vp.completion_percentage = 100 THEN 'Completed'
            WHEN vp.completion_percentage < 100
            AND vp.completion_percentage > 0 THEN 'In Completed'
            ELSE 'Pending'
        END::TEXT AS completion_status,
        CASE
            WHEN cv.position = (
                SELECT
                    MIN(cv2.position)
                FROM
                    public.course_videos cv2
                WHERE
                    cv2.course_topic_id = cv.course_topic_id
                    AND cv2.is_active = TRUE
                    AND cv2.is_deleted = FALSE
            ) THEN FALSE
            WHEN EXISTS (
                SELECT
                    1
                FROM
                    public.course_videos cv1
                    INNER JOIN public.video_progresses vp1 ON cv1.course_video_id = vp1.course_video_id
                    AND vp1.is_active = TRUE
                    AND vp1.is_deleted = FALSE
                WHERE
                    cv1.is_active = TRUE
                    AND cv1.is_deleted = FALSE
                    AND cv1.course_topic_id = cv.course_topic_id
                    AND vp1.student_id = p_student_id
                    AND cv1.position = (
                        SELECT
                            MAX(cv2.position)
                        FROM
                            public.course_videos cv2
                        WHERE
                            cv2.course_topic_id = cv.course_topic_id
                            AND cv2.is_active = TRUE
                            AND cv2.is_deleted = FALSE
                            AND cv2.position < cv.position
                    )
                    AND vp1.is_completed = TRUE
            ) THEN FALSE
            ELSE TRUE
        END::BOOLEAN AS is_video_locked
    FROM
        public.course_videos cv
        LEFT JOIN public.video_progresses vp ON cv.course_video_id = vp.course_video_id
            AND vp.student_id = p_student_id
            AND vp.is_active = TRUE
            AND vp.is_deleted = FALSE
    WHERE
        cv.is_active = TRUE
        AND cv.is_deleted = FALSE
        AND cv.course_topic_id = p_course_topic_id
    ORDER BY
        cv.position ASC;
END;
$func$;   

**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`

**PostgreSQL Function** 

CREATE OR REPLACE FUNCTION get_video_details_by_id(
    p_course_video_id INT DEFAULT 0
)
RETURNS TABLE (
    course_video_id INT,
    video_name TEXT,
    video_url TEXT,
    thumbnail_url TEXT,
    duration INT,
    "position" INT,
    bunny_video_id TEXT,
    course_topic_id INT,
    course_id INT,
    teacher_name TEXT,
    teacher_qualification TEXT,
    profile_picture_url TEXT,
    next_course_video_id INT,
    next_video_name TEXT,
    next_video_duration INT,
    previous_course_video_id INT,
    previous_video_name TEXT,
    previous_video_duration INT
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT
        cv.course_video_id::INT,
        CONCAT('Lecture:', cv.position, ' ', cv.video_name)::TEXT AS video_name,
        cv.video_url::TEXT,
        cv.thumbnail_url::TEXT,
        cv.duration_seconds::INT AS duration,
        cv.position::INT,
        cv.bunny_video_id::TEXT,
        cv.course_topic_id::INT,
        cv.course_id::INT,
        t.full_name::TEXT AS teacher_name,
        t.teacher_qualification::TEXT,
        t.profile_picture_url::TEXT,
        -- Next video details (using MIN for scalability)
        (
            SELECT cv_next.course_video_id
            FROM public.course_videos cv_next
            WHERE cv_next.course_topic_id = cv.course_topic_id
              AND cv_next.position > cv.position
              AND cv_next.is_active = TRUE
              AND cv_next.is_deleted = FALSE
            ORDER BY cv_next.position ASC
            LIMIT 1
        )::INT AS next_course_video_id,
        (
            SELECT cv_next.video_name
            FROM public.course_videos cv_next
            WHERE cv_next.course_topic_id = cv.course_topic_id
              AND cv_next.position > cv.position
              AND cv_next.is_active = TRUE
              AND cv_next.is_deleted = FALSE
            ORDER BY cv_next.position ASC
            LIMIT 1
        )::TEXT AS next_video_name,
        (
            SELECT cv_next.duration_seconds
            FROM public.course_videos cv_next
            WHERE cv_next.course_topic_id = cv.course_topic_id
              AND cv_next.position > cv.position
              AND cv_next.is_active = TRUE
              AND cv_next.is_deleted = FALSE
            ORDER BY cv_next.position ASC
            LIMIT 1
        )::INT AS next_video_duration,
        -- Previous video details (using MAX for scalability)
        (
            SELECT cv_prev.course_video_id
            FROM public.course_videos cv_prev
            WHERE cv_prev.course_topic_id = cv.course_topic_id
              AND cv_prev.position < cv.position
              AND cv_prev.is_active = TRUE
              AND cv_prev.is_deleted = FALSE
            ORDER BY cv_prev.position DESC
            LIMIT 1
        )::INT AS previous_course_video_id,
        (
            SELECT cv_prev.video_name
            FROM public.course_videos cv_prev
            WHERE cv_prev.course_topic_id = cv.course_topic_id
              AND cv_prev.position < cv.position
              AND cv_prev.is_active = TRUE
              AND cv_prev.is_deleted = FALSE
            ORDER BY cv_prev.position DESC
            LIMIT 1
        )::TEXT AS previous_video_name,
        (
            SELECT cv_prev.duration_seconds
            FROM public.course_videos cv_prev
            WHERE cv_prev.course_topic_id = cv.course_topic_id
              AND cv_prev.position < cv.position
              AND cv_prev.is_active = TRUE
              AND cv_prev.is_deleted = FALSE
            ORDER BY cv_prev.position DESC
            LIMIT 1
        )::INT AS previous_video_duration
    FROM
        public.course_videos cv
        INNER JOIN public.teacher_courses tc ON cv.course_id = tc.course_id AND tc.is_active = TRUE AND tc.is_deleted = FALSE
        INNER JOIN public.teachers t ON tc.teacher_id = t.teacher_id
    WHERE
        cv.course_video_id = p_course_video_id
        AND cv.is_active = TRUE
        AND cv.is_deleted = FALSE;
END;
$func$;   

**Route**  
   Add a route in `course.routes.ts`

**controller**  
   Add a controller in `course.controller.ts`

**service**  
   Add a service in `course.service.ts`


**PostgreSQL Function** 

CREATE OR REPLACE FUNCTION get_programs_by_tenant(
    p_tenant_id INT DEFAULT 0
)
RETURNS TABLE (
    program_id INT,
    program_name TEXT,
    program_thumbnail_url TEXT,
    tenant_id INT,
    is_active BOOLEAN,
    is_deleted BOOLEAN,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)
LANGUAGE plpgsql
AS $func$
BEGIN
    RETURN QUERY
    SELECT 
        p.program_id::INT,
        p.program_name::TEXT,
        p.program_thumbnail_url::TEXT,
        p.tenant_id::INT,
        p.is_active::BOOLEAN,
        p.is_deleted::BOOLEAN,
        p.created_at::TIMESTAMP,
        p.updated_at::TIMESTAMP
    FROM 
        public.programs p
    WHERE 
        p.tenant_id = p_tenant_id 
        AND p.is_active = TRUE 
        AND p.is_deleted = FALSE
    ORDER BY 
        p.program_name;
END;
$func$;

**Route**  
   Add a route in `program.routes.ts`

**controller**  
   Add a controller in `program.controller.ts`

**service**  
   Add a service in `program.service.ts`