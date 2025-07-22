/**
 * @file utils/duration-format.utils.ts
 * @description Utility functions for formatting duration values
 */

/**
 * Format duration from seconds to human-readable format
 * 
 * @param durationSeconds Duration in seconds (can be null)
 * @returns Formatted duration string like "1 hr 32 min 25 sec" or null if input is null
 * 
 * @example
 * formatDurationFromSeconds(3945) => "1 hr 5 min 45 sec"
 * formatDurationFromSeconds(1925) => "32 min 5 sec"
 * formatDurationFromSeconds(45) => "45 sec"
 * formatDurationFromSeconds(3600) => "1 hr"
 * formatDurationFromSeconds(120) => "2 min"
 * formatDurationFromSeconds(0) => "0 sec"
 * formatDurationFromSeconds(null) => null
 */
export function formatDurationFromSeconds(durationSeconds: number | null): string | null {
  // Handle null or undefined values
  if (durationSeconds === null || durationSeconds === undefined) {
    return null;
  }

  // Handle zero duration
  if (durationSeconds === 0) {
    return "0 sec";
  }

  // Handle negative values (treat as 0)
  if (durationSeconds < 0) {
    return "0 sec";
  }

  // Convert to integer to handle decimal values
  const totalSeconds = Math.floor(durationSeconds);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Build the formatted string
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  }

  if (minutes > 0) {
    parts.push(`${minutes} min`);
  }

  if (seconds > 0) {
    parts.push(`${seconds} sec`);
  }

  // If all values are 0 (shouldn't happen due to earlier check, but safety)
  if (parts.length === 0) {
    return "0 sec";
  }

  return parts.join(' ');
}

/**
 * Format duration from seconds to compact format (without units for 0 values)
 * 
 * @param durationSeconds Duration in seconds (can be null)
 * @returns Compact formatted duration string or null if input is null
 * 
 * @example
 * formatDurationCompact(3945) => "1h 5m 45s"
 * formatDurationCompact(1925) => "32m 5s"
 * formatDurationCompact(45) => "45s"
 * formatDurationCompact(null) => null
 */
export function formatDurationCompact(durationSeconds: number | null): string | null {
  // Handle null or undefined values
  if (durationSeconds === null || durationSeconds === undefined) {
    return null;
  }

  // Handle zero duration
  if (durationSeconds === 0) {
    return "0s";
  }

  // Handle negative values (treat as 0)
  if (durationSeconds < 0) {
    return "0s";
  }

  // Convert to integer to handle decimal values
  const totalSeconds = Math.floor(durationSeconds);

  // Calculate hours, minutes, and seconds
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  // Build the formatted string
  const parts: string[] = [];

  if (hours > 0) {
    parts.push(`${hours}h`);
  }

  if (minutes > 0) {
    parts.push(`${minutes}m`);
  }

  if (seconds > 0) {
    parts.push(`${seconds}s`);
  }

  // If all values are 0 (shouldn't happen due to earlier check, but safety)
  if (parts.length === 0) {
    return "0s";
  }

  return parts.join(' ');
}

/**
 * Parse formatted duration string back to seconds
 * 
 * @param durationString Formatted duration string like "1 hr 32 min 25 sec"
 * @returns Duration in seconds or null if parsing fails
 * 
 * @example
 * parseDurationToSeconds("1 hr 32 min 25 sec") => 5545
 * parseDurationToSeconds("32 min 5 sec") => 1925
 * parseDurationToSeconds("45 sec") => 45
 */
export function parseDurationToSeconds(durationString: string | null): number | null {
  if (!durationString) {
    return null;
  }

  let totalSeconds = 0;
  
  // Match hours
  const hoursMatch = durationString.match(/(\d+)\s*hr/i);
  if (hoursMatch && hoursMatch[1]) {
    totalSeconds += parseInt(hoursMatch[1]) * 3600;
  }

  // Match minutes
  const minutesMatch = durationString.match(/(\d+)\s*min/i);
  if (minutesMatch && minutesMatch[1]) {
    totalSeconds += parseInt(minutesMatch[1]) * 60;
  }

  // Match seconds
  const secondsMatch = durationString.match(/(\d+)\s*sec/i);
  if (secondsMatch && secondsMatch[1]) {
    totalSeconds += parseInt(secondsMatch[1]);
  }

  return totalSeconds;
}
