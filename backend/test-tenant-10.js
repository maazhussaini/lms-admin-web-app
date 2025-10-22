const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function checkTenant() {
  try {
    console.log('Checking tenant 10 with middleware (is_deleted = false):');
    const activeTenant = await prisma.tenant.findMany({
      where: { tenant_id: 10 }
    });
    console.log('Active tenant:', JSON.stringify(activeTenant, null, 2));

    console.log('\nChecking tenant 10 with explicit OR (all records):');
    const allTenants = await prisma.tenant.findFirst({
      where: {
        tenant_id: 10,
        OR: [
          { is_deleted: false },
          { is_deleted: true }
        ]
      }
    });
    console.log('All tenant records:', JSON.stringify(allTenants, null, 2));

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenant();
