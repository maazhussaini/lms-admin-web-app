// Test the tenant service deleteTenant method with centralized prisma
const path = require('path');

// Import the service using TypeScript
async function testService() {
  try {
    // Dynamically import the TypeScript service
    const tsNode = require('ts-node');
    tsNode.register({
      project: path.join(__dirname, 'tsconfig.json'),
      transpileOnly: true
    });

    const tenantService = require('./src/services/tenant.service').default;
    
    console.log('Testing deleteTenant with already deleted tenant (ID: 10)...');
    const result = await tenantService.deleteTenant(10, 5, '127.0.0.1');
    
    console.log('SUCCESS! Result:');
    console.log(JSON.stringify(result, null, 2));
    
  } catch (error) {
    console.error('Error:', error.message);
    console.error('Stack:', error.stack);
  }
}

testService();
