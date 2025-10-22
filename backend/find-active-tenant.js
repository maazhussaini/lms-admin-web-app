const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function findNonDeletedTenant() {
  try {
    const nonDeletedTenant = await prisma.tenant.findFirst({
      where: {
        is_deleted: false
      },
      select: {
        tenant_id: true,
        tenant_name: true,
        is_deleted: true
      }
    });
    
    if (nonDeletedTenant) {
      console.log('Found non-deleted tenant:', JSON.stringify(nonDeletedTenant, null, 2));
    } else {
      console.log('No non-deleted tenants found');
    }

  } catch (error) {
    console.error('Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

findNonDeletedTenant();
