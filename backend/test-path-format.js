/**
 * Quick test to verify path formatting is correct
 */

const NETWORK_UPLOAD_PATH = '\\\\DESKTOP-ERNLAOT\\uploads';
const tenantId = 12;
const fileName = 'logo_lg.png';

// Test 1: Template literal with double backslash (attempts escape)
const wrongPath1 = `${NETWORK_UPLOAD_PATH}\\\\${tenantId}`;
console.log('Wrong Path 1 (template literal \\\\):', wrongPath1);

// Test 2: String concatenation with single backslash (CORRECT)
const correctPath = NETWORK_UPLOAD_PATH + '\\' + tenantId;
console.log('Correct Path (concatenation):', correctPath);

// Test 3: Full file path
const fullPath = NETWORK_UPLOAD_PATH + '\\' + tenantId + '\\' + fileName;
console.log('Full File Path:', fullPath);

// Test 4: What we expect
const expected = '\\\\DESKTOP-ERNLAOT\\uploads\\12\\logo_lg.png';
console.log('Expected Path:', expected);

// Test 5: Are they equal?
console.log('Paths match?', fullPath === expected);
