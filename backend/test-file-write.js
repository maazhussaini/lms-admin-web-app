/**
 * Direct file write test to network share
 * Run this to debug file upload issues
 */

const fs = require('fs');
const path = require('path');

const NETWORK_PATH = '\\\\DESKTOP-ERNLAOT\\uploads';
const TENANT_ID = 12;

console.log('=== FILE WRITE TEST STARTED ===');
console.log('Network Path:', NETWORK_PATH);
console.log('Tenant ID:', TENANT_ID);

// Test 1: Check network path exists
console.log('\n--- Test 1: Network Path Access ---');
try {
  const exists = fs.existsSync(NETWORK_PATH);
  console.log('Network path exists:', exists);
  
  if (!exists) {
    console.log('Creating network path...');
    fs.mkdirSync(NETWORK_PATH, { recursive: true });
    console.log('Network path created');
  }
} catch (error) {
  console.error('Error accessing network path:', error);
  process.exit(1);
}

// Test 2: Create tenant directory
console.log('\n--- Test 2: Tenant Directory ---');
const tenantDir = path.join(NETWORK_PATH, TENANT_ID.toString());
console.log('Tenant directory path:', tenantDir);

try {
  if (!fs.existsSync(tenantDir)) {
    console.log('Creating tenant directory...');
    fs.mkdirSync(tenantDir, { recursive: true });
    console.log('Tenant directory created');
  } else {
    console.log('Tenant directory already exists');
  }
  
  // Verify it was created
  const stats = fs.statSync(tenantDir);
  console.log('Directory verified:', {
    isDirectory: stats.isDirectory(),
    mode: stats.mode.toString(8),
    created: stats.birthtime
  });
} catch (error) {
  console.error('Error creating tenant directory:', error);
  process.exit(1);
}

// Test 3: Write test file with buffer
console.log('\n--- Test 3: File Write with Buffer ---');
const testFileName = 'test_logo.png';
const testFilePath = path.join(tenantDir, testFileName);
console.log('Test file path:', testFilePath);

// Create a test buffer (small PNG image data)
const testBuffer = Buffer.from([
  0x89, 0x50, 0x4E, 0x47, 0x0D, 0x0A, 0x1A, 0x0A,  // PNG signature
  0x00, 0x00, 0x00, 0x0D, 0x49, 0x48, 0x44, 0x52  // IHDR chunk start
]);

console.log('Test buffer size:', testBuffer.length, 'bytes');

try {
  console.log('Writing file...');
  
  // Delete if exists
  if (fs.existsSync(testFilePath)) {
    console.log('Deleting existing test file...');
    fs.unlinkSync(testFilePath);
  }
  
  // Write with explicit options
  fs.writeFileSync(testFilePath, testBuffer, { 
    mode: 0o666,
    flag: 'w'
  });
  
  console.log('File write command executed');
  
  // Verify file was written
  if (!fs.existsSync(testFilePath)) {
    console.error('❌ FAILED: File does not exist after write!');
    process.exit(1);
  }
  
  const stats = fs.statSync(testFilePath);
  console.log('✓ File written successfully:', {
    exists: true,
    size: stats.size,
    expectedSize: testBuffer.length,
    sizeMatch: stats.size === testBuffer.length,
    mode: stats.mode.toString(8),
    path: testFilePath
  });
  
  if (stats.size !== testBuffer.length) {
    console.error('❌ WARNING: File size mismatch!');
  } else {
    console.log('✓ File size matches perfectly!');
  }
  
  // Read back and verify
  const readBuffer = fs.readFileSync(testFilePath);
  const bufferMatch = readBuffer.equals(testBuffer);
  console.log('✓ Buffer content match:', bufferMatch);
  
  if (!bufferMatch) {
    console.error('❌ WARNING: File content does not match!');
  }
  
} catch (error) {
  console.error('❌ Error writing test file:', error);
  console.error('Error details:', {
    name: error.name,
    message: error.message,
    code: error.code,
    errno: error.errno,
    syscall: error.syscall,
    path: error.path
  });
  process.exit(1);
}

// Test 4: Write file with fs.promises (async)
console.log('\n--- Test 4: Async File Write ---');
const testFileName2 = 'test_logo_async.png';
const testFilePath2 = path.join(tenantDir, testFileName2);

(async () => {
  try {
    console.log('Writing async file...');
    await fs.promises.writeFile(testFilePath2, testBuffer, { 
      mode: 0o666,
      flag: 'w'
    });
    
    console.log('Async file write completed');
    
    const stats = await fs.promises.stat(testFilePath2);
    console.log('✓ Async file written:', {
      exists: true,
      size: stats.size,
      expectedSize: testBuffer.length,
      sizeMatch: stats.size === testBuffer.length
    });
    
  } catch (error) {
    console.error('❌ Error in async write:', error);
  }
  
  // Test 5: List directory contents
  console.log('\n--- Test 5: Directory Contents ---');
  try {
    const files = fs.readdirSync(tenantDir);
    console.log('Files in tenant directory:', files);
    
    files.forEach(file => {
      const filePath = path.join(tenantDir, file);
      const stats = fs.statSync(filePath);
      console.log(`  - ${file}: ${stats.size} bytes`);
    });
    
  } catch (error) {
    console.error('Error reading directory:', error);
  }
  
  console.log('\n=== FILE WRITE TEST COMPLETED ===');
  console.log('✓ All tests passed! File writing is working correctly.');
  console.log('\nNow check the actual upload path for your files:');
  console.log(tenantDir);
})();
