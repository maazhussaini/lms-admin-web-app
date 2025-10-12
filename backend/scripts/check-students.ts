import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkStudents() {
  try {
    console.log('\n=== Checking students table ===');
    const students: any[] = await prisma.$queryRawUnsafe('SELECT * FROM students LIMIT 5');
    console.log(`Found ${students.length} student records:`);
    console.log(JSON.stringify(students, null, 2));

    console.log('\n=== Checking student_email_addresses table ===');
    const emails: any[] = await prisma.$queryRawUnsafe('SELECT * FROM student_email_addresses LIMIT 5');
    console.log(`Found ${emails.length} email records:`);
    console.log(JSON.stringify(emails, null, 2));

    console.log('\n=== Checking student_institutes table ===');
    const institutes: any[] = await prisma.$queryRawUnsafe('SELECT * FROM student_institutes LIMIT 5');
    console.log(`Found ${institutes.length} institute records:`);
    console.log(JSON.stringify(institutes, null, 2));

    console.log('\n=== Checking countries table ===');
    const countries: any[] = await prisma.$queryRawUnsafe('SELECT * FROM countries LIMIT 5');
    console.log(`Found ${countries.length} country records:`);
    console.log(JSON.stringify(countries, null, 2));

    console.log('\n=== Checking cities table ===');
    const cities: any[] = await prisma.$queryRawUnsafe('SELECT * FROM cities LIMIT 5');
    console.log(`Found ${cities.length} city records:`);
    console.log(JSON.stringify(cities, null, 2));

    console.log('\n=== Checking student_phone_numbers table ===');
    const phones: any[] = await prisma.$queryRawUnsafe('SELECT * FROM student_phone_numbers LIMIT 5');
    console.log(`Found ${phones.length} phone records:`);
    console.log(JSON.stringify(phones, null, 2));

    console.log('\n=== Checking states table ===');
    const states: any[] = await prisma.$queryRawUnsafe('SELECT * FROM states LIMIT 5');
    console.log(`Found ${states.length} state records:`);
    console.log(JSON.stringify(states, null, 2));

  } catch (error: any) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkStudents();
