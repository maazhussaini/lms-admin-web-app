/**
 * @file check-tenants.ts
 * @description Script to check existing tenants in the database
 */

import prisma from '../src/config/database';

async function checkTenants() {
  try {
    console.log('Checking tenants in database...\n');

    // Get all tenants (including soft-deleted ones) - NO WHERE CLAUSE
    const allTenants = await prisma.$queryRaw<Array<{
      tenant_id: number;
      tenant_name: string;
      tenant_status: string;
      is_deleted: boolean;
      deleted_at: Date | null;
      created_at: Date;
    }>>`
      SELECT 
        tenant_id, 
        tenant_name, 
        tenant_status::text as tenant_status, 
        is_deleted, 
        deleted_at, 
        created_at 
      FROM tenants 
      ORDER BY tenant_id ASC
    `;

    console.log(`Total tenants in database (including deleted): ${allTenants.length}\n`);

    if (allTenants.length === 0) {
      console.log('No tenants found in database!');
      console.log('You may need to run the seed script first.');
      return;
    }

    console.log('Tenant List:');
    console.log('============');
    
    allTenants.forEach(tenant => {
      const deletedStatus = tenant.is_deleted ? '❌ DELETED' : '✅ ACTIVE';
      console.log(`ID: ${tenant.tenant_id} | Name: ${tenant.tenant_name} | Status: ${tenant.tenant_status} | ${deletedStatus}`);
      if (tenant.deleted_at) {
        console.log(`   └─ Deleted at: ${tenant.deleted_at}`);
      }
    });

    console.log('\n');
    
    // Check for tenant ID 11 specifically
    const tenant11 = allTenants.find(t => t.tenant_id === 11);

    if (tenant11) {
      console.log('✅ Tenant ID 11 Found!');
      console.log('====================');
      console.log(`Name: ${tenant11.tenant_name}`);
      console.log(`Status: ${tenant11.tenant_status}`);
      console.log(`Is Deleted: ${tenant11.is_deleted}`);
      if (tenant11.deleted_at) {
        console.log(`Deleted At: ${tenant11.deleted_at}`);
      }
      
      // Get phone numbers and emails
      const phoneNumbers = await prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count FROM tenant_phone_numbers 
        WHERE tenant_id = 11 AND deleted_at IS NULL
      `;
      const emailAddresses = await prisma.$queryRaw<Array<{count: bigint}>>`
        SELECT COUNT(*) as count FROM tenant_email_addresses 
        WHERE tenant_id = 11 AND deleted_at IS NULL
      `;
      
      console.log(`Phone Numbers: ${phoneNumbers[0].count}`);
      console.log(`Email Addresses: ${emailAddresses[0].count}`);
    } else {
      console.log('⚠️  Tenant ID 11 NOT FOUND in database!');
      console.log('This is why you\'re getting a 404 error.');
    }

  } catch (error) {
    console.error('Error checking tenants:', error);
  } finally {
    await prisma.$disconnect();
  }
}

checkTenants();
