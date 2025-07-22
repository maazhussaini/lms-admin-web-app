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