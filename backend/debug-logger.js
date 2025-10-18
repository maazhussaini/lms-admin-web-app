/**
 * Enhanced logging utility for debugging file uploads
 */

const originalConsoleLog = console.log;
const originalConsoleError = console.error;

const logWithTimestamp = (...args) => {
  const timestamp = new Date().toISOString();
  originalConsoleLog(`[${timestamp}]`, ...args);
};

const errorWithTimestamp = (...args) => {
  const timestamp = new Date().toISOString();
  originalConsoleError(`[${timestamp}] ERROR:`, ...args);
};

console.log = logWithTimestamp;
console.error = errorWithTimestamp;

console.log('='.repeat(80));
console.log('FILE UPLOAD DEBUGGING ENABLED');
console.log('Timestamp:', new Date().toISOString());
console.log('='.repeat(80));

module.exports = { logWithTimestamp, errorWithTimestamp };
