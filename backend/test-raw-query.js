const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function testRawQuery() {
  try {
    console.log('Testing raw query for tenant 10 (should find even if deleted):');
    const result = await prisma.$queryRaw`
      SELECT * FROM tenants 
      WHERE tenant_id = ${10}
      LIMIT 1
    `.then(results => results[0] || null);
    
    console.log('Result:', JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testRawQuery();
