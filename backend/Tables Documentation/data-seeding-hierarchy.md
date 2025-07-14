# Data Seeding Hierarchy

This document provides the correct order for inserting data into LMS tables, ensuring all foreign key and relationship constraints are satisfied. The hierarchy is based on the actual dependencies between tables, starting from the most independent tables to the most dependent.

---

## 1. Core Reference Tables (No Foreign Keys)
- **Country**

## 2. Tenant Setup (Tenant is required for most entities)
- **Tenant** (depends on Country for address fields, if any)

## 3. Dependent Reference Tables
- **State** (depends on Country)
- **City** (depends on State)

## 4. Client and Tenant Contact Info
- **Client** (depends on Tenant)
- **ClientTenant** (depends on Client, Tenant)
- **TenantPhoneNumber** (depends on Tenant)
- **TenantEmailAddress** (depends on Tenant)

## 5. Academic Institution Structure
- **Program** (depends on Tenant)
- **Specialization** (depends on Tenant, Program)
- **Institute** (depends on Tenant)

## 6. System User and Roles
- **Role**
- **Screen**
- **SystemUser** (depends on Tenant, Role)
- **UserScreen** (depends on SystemUser, Screen, Tenant)
- **RoleScreen** (depends on Role, Screen, Tenant)

## 7. Academic Relationships
- **Student** (depends on Tenant)
- **StudentEmailAddress** (depends on Student, Tenant)
- **StudentPhoneNumber** (depends on Student, Tenant)
- **StudentDevice** (depends on Student, Tenant)
- **StudentInstitute** (depends on Student, Institute, Program, Specialization, Tenant)
- **Teacher** (depends on Tenant)
- **TeacherEmailAddress** (depends on Teacher, Tenant)
- **TeacherPhoneNumber** (depends on Teacher, Tenant)

## 8. Course and Content Structure
- **Course** (depends on Tenant)
- **CourseModule** (depends on Course, Tenant)
- **CourseTopic** (depends on CourseModule, Tenant)
- **CourseVideo** (depends on CourseTopic, Tenant)
- **CourseDocument** (depends on CourseTopic, Tenant)

## 9. Enrollment and Sessions
- **Enrollment** (depends on Student, Course, Tenant)
- **EnrollmentStatusHistory** (depends on Enrollment, SystemUser, Tenant)
- **StudentCourseProgress** (depends on Enrollment, Course, Tenant)
- **TeacherCourse** (depends on Teacher, Course, Tenant)
- **CourseSession** (depends on Course, Teacher, Tenant)
- **CourseSessionEnrollment** (depends on CourseSession, Enrollment, Tenant)
- **CourseSessionSettings** (depends on CourseSession, Tenant)
- **VideoProgress** (depends on CourseSessionEnrollment, CourseVideo, Tenant)

## 10. Assessment and Assignments
- **Assignment** (depends on Course, Teacher, Tenant)
- **AssignmentMapping** (depends on Assignment, Tenant)
- **StudentAssignment** (depends on Assignment, Student, Tenant)
- **AssignmentSubmissionFile** (depends on StudentAssignment, Tenant)

## 11. Quiz and Evaluation
- **Quiz** (depends on Course, Teacher, Tenant)
- **QuizMapping** (depends on Quiz, Tenant)
- **QuizQuestion** (depends on Quiz, Teacher, Tenant)
- **QuizQuestionOption** (depends on QuizQuestion, Tenant)
- **QuizQuestionAnswer** (depends on QuizQuestion, Student, Tenant)
- **QuizAttempt** (depends on Quiz, Student, Tenant)
- **QuizAttemptAnswer** (depends on QuizAttempt, QuizQuestion, Student, Teacher, Tenant)

## 12. Notification and Communication
- **Notification** (depends on Tenant)
- **CourseSessionAnnouncement** (depends on CourseSession, Tenant)
- **NotificationDelivery** (depends on Notification, Tenant)
- **EmailQueue** (depends on Tenant)
- **NotificationTemplate** (depends on Tenant)
- **PushNotificationDevice** (depends on Tenant)

---

> **Note:**
> - Always insert parent/master tables before child/dependent tables.
> - Audit fields (created_by, updated_by, etc.) may require SystemUser records to exist first.
> - Some tables may have additional dependencies not listed here if custom constraints exist in migrations.

This hierarchy ensures a correct, single-pass data seeding flow for the LMS database.
