/**
 * Test script to verify the getEnrolledCoursesByStudentId function matches SQL function behavior
 */

const { studentService } = require('./dist/services/student.service');

async function testGetEnrolledCourses() {
  try {
    // Mock requesting user (SUPER_ADMIN for testing)
    const requestingUser = {
      id: 1,
      user_type: 'SUPER_ADMIN',
      tenantId: 1,
      email: 'admin@test.com'
    };

    // Test parameters matching SQL function call: SELECT * FROM get_enrolled_courses_by_student_id(1, '');
    const params = {
      page: 1,
      limit: 10,
      filters: {
        search: '' // Empty search like in SQL function call
      }
    };

    console.log('Testing getEnrolledCoursesByStudentId with:');
    console.log('- Student ID: 1');
    console.log('- Search Query: "" (empty)');
    console.log('- isEnrolled: true (default - should return ACTIVE/COMPLETED enrollments)');
    console.log('');

    // Call the function with isEnrolled=true (default)
    const result = await studentService.getEnrolledCoursesByStudentId(
      1, // p_student_id
      requestingUser,
      params,
      true // p_isEnrolled = true (ACTIVE/COMPLETED enrollments)
    );

    console.log('Function executed successfully!');
    console.log('');
    console.log('Result structure:');
    console.log('- Items count:', result.items.length);
    console.log('- Pagination:', result.pagination);
    console.log('');

    if (result.items.length > 0) {
      console.log('Sample item structure (first item):');
      console.log(JSON.stringify(result.items[0], null, 2));
      console.log('');
      
      // Verify the structure matches SQL function return columns
      const expectedColumns = [
        'enrollment_id',
        'specialization_program_id', 
        'course_id',
        'specialization_id',
        'program_id',
        'course_name',
        'start_date',
        'end_date',
        'specialization_name',
        'program_name',
        'teacher_name',
        'course_total_hours',
        'overall_progress_percentage'
      ];
      
      const actualColumns = Object.keys(result.items[0]);
      const missingColumns = expectedColumns.filter(col => !actualColumns.includes(col));
      const extraColumns = actualColumns.filter(col => !expectedColumns.includes(col));
      
      console.log('Column validation:');
      if (missingColumns.length === 0 && extraColumns.length === 0) {
        console.log('✅ All expected columns are present and match SQL function return structure!');
      } else {
        if (missingColumns.length > 0) {
          console.log('❌ Missing columns:', missingColumns);
        }
        if (extraColumns.length > 0) {
          console.log('⚠️  Extra columns (not in SQL):', extraColumns);
        }
      }
    } else {
      console.log('No enrolled courses found for student ID 1');
    }

    // Test with isEnrolled=false
    console.log('\n--- Testing with isEnrolled=false (non-ACTIVE/COMPLETED enrollments) ---');
    const resultFalse = await studentService.getEnrolledCoursesByStudentId(
      1,
      requestingUser,
      params,
      false // p_isEnrolled = false
    );
    
    console.log('Results with isEnrolled=false:');
    console.log('- Items count:', resultFalse.items.length);

  } catch (error) {
    console.error('Test failed with error:', error.message);
    console.error('Stack trace:', error.stack);
  }
}

// Run the test
testGetEnrolledCourses()
  .then(() => console.log('\nTest completed'))
  .catch(console.error);
