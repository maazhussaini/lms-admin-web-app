/**
 * @file shared/utils/duration.utils.ts
 * @description Comprehensive duration formatting utilities
 * Single source of truth for all duration formatting needs across applications
 */

/**
 * Duration format types for different use cases
 */
export type DurationFormat = 
  | 'compact'     // "1h 5m", "32m", "45s"
  | 'display'     // "1 hr 5 min", "32 min", "45 sec"
  | 'timestamp'   // "1:05:30", "32:45", "0:45"
  | 'course'      // "1 Hrs 5 Min", "32 Min", "45 Sec" (UI specific)

/**
 * Configuration for duration formatting
 */
interface DurationFormatConfig {
  showSeconds?: boolean;
  padNumbers?: boolean;
  unitStyle?: 'short' | 'long' | 'symbol';
  zeroDisplay?: string;
}

/**
 * Default configurations for each format type
 */
const DEFAULT_CONFIGS: Record<DurationFormat, DurationFormatConfig> = {
  compact: {
    showSeconds: true,
    unitStyle: 'symbol',
    zeroDisplay: '0s'
  },
  display: {
    showSeconds: true,
    unitStyle: 'long',
    zeroDisplay: '0 sec'
  },
  timestamp: {
    showSeconds: true,
    padNumbers: true,
    zeroDisplay: '0:00'
  },
  course: {
    showSeconds: false,
    unitStyle: 'short',
    zeroDisplay: 'Duration TBD'
  }
};

/**
 * Format duration from seconds with flexible output formats
 * 
 * @param seconds - Duration in seconds
 * @param format - Output format type
 * @param config - Optional configuration overrides
 * @returns Formatted duration string
 * 
 * @example
 * formatDurationFromSeconds(3945, 'compact') => "1h 5m 45s"
 * formatDurationFromSeconds(3945, 'display') => "1 hr 5 min 45 sec"
 * formatDurationFromSeconds(3945, 'timestamp') => "1:05:45"
 * formatDurationFromSeconds(1925, 'course') => "32 Min"
 */
export function formatDurationFromSeconds(
  seconds: number | null | undefined,
  format: DurationFormat = 'display',
  config?: Partial<DurationFormatConfig>
): string {
  if (!seconds || seconds <= 0) {
    return DEFAULT_CONFIGS[format].zeroDisplay || '0';
  }

  const finalConfig = { ...DEFAULT_CONFIGS[format], ...config };
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  switch (format) {
    case 'compact':
      return formatCompact(hours, minutes, remainingSeconds, finalConfig);
    case 'display':
      return formatDisplay(hours, minutes, remainingSeconds, finalConfig);
    case 'timestamp':
      return formatTimestamp(hours, minutes, remainingSeconds);
    case 'course':
      return formatCourse(hours, minutes, remainingSeconds, finalConfig);
    default:
      return formatDisplay(hours, minutes, remainingSeconds, finalConfig);
  }
}

/**
 * Format duration from hours (for course durations)
 * 
 * @param hours - Duration in hours (can be decimal)
 * @param format - Output format type
 * @returns Formatted duration string
 * 
 * @example
 * formatDurationFromHours(1.5, 'course') => "1 Hrs 30 Min"
 * formatDurationFromHours(0.75, 'course') => "45 Min"
 */
export function formatDurationFromHours(
  hours: number | null | undefined,
  format: DurationFormat = 'course'
): string {
  if (!hours || hours <= 0) {
    return DEFAULT_CONFIGS[format].zeroDisplay || 'Duration TBD';
  }

  const totalSeconds = hours * 3600;
  return formatDurationFromSeconds(totalSeconds, format);
}

/**
 * Format duration from minutes
 * 
 * @param minutes - Duration in minutes
 * @param format - Output format type
 * @returns Formatted duration string
 */
export function formatDurationFromMinutes(
  minutes: number | null | undefined,
  format: DurationFormat = 'display'
): string {
  if (!minutes || minutes <= 0) {
    return DEFAULT_CONFIGS[format].zeroDisplay || '0';
  }

  const totalSeconds = minutes * 60;
  return formatDurationFromSeconds(totalSeconds, format);
}

/**
 * Parse duration string and return seconds
 * 
 * @param duration - Duration string in various formats
 * @returns Duration in seconds, or 0 if invalid
 * 
 * @example
 * parseDurationToSeconds("1:05:30") => 3930
 * parseDurationToSeconds("1h 5m 30s") => 3930
 * parseDurationToSeconds("65 minutes") => 3900
 */
export function parseDurationToSeconds(duration: string): number {
  if (!duration) return 0;

  // Handle timestamp format (H:MM:SS or M:SS)
  const timestampMatch = duration.match(/^(\d+):(\d{2}):(\d{2})$|^(\d+):(\d{2})$/);
  if (timestampMatch) {
    if (timestampMatch[1] && timestampMatch[2] && timestampMatch[3]) {
      // H:MM:SS format
      return parseInt(timestampMatch[1]) * 3600 + parseInt(timestampMatch[2]) * 60 + parseInt(timestampMatch[3]);
    } else if (timestampMatch[4] && timestampMatch[5]) {
      // M:SS format
      return parseInt(timestampMatch[4]) * 60 + parseInt(timestampMatch[5]);
    }
  }

  // Handle compact format (1h 5m 30s)
  const compactMatch = duration.match(/(?:(\d+)h\s*)?(?:(\d+)m\s*)?(?:(\d+)s)?/);
  if (compactMatch) {
    const hours = parseInt(compactMatch[1] || '0');
    const minutes = parseInt(compactMatch[2] || '0');
    const seconds = parseInt(compactMatch[3] || '0');
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
}

// Helper formatting functions

function formatCompact(hours: number, minutes: number, seconds: number, config: DurationFormatConfig): string {
  const parts: string[] = [];
  
  if (hours > 0) parts.push(`${hours}h`);
  if (minutes > 0) parts.push(`${minutes}m`);
  if (config.showSeconds && seconds > 0) parts.push(`${seconds}s`);
  
  return parts.length > 0 ? parts.join(' ') : (config.zeroDisplay || '0s');
}

function formatDisplay(hours: number, minutes: number, seconds: number, config: DurationFormatConfig): string {
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(hours === 1 ? '1 hr' : `${hours} hrs`);
  }
  if (minutes > 0) {
    parts.push(minutes === 1 ? '1 min' : `${minutes} min`);
  }
  if (config.showSeconds && seconds > 0) {
    parts.push(seconds === 1 ? '1 sec' : `${seconds} sec`);
  }
  
  return parts.length > 0 ? parts.join(' ') : (config.zeroDisplay || '0 sec');
}

function formatTimestamp(hours: number, minutes: number, seconds: number): string {
  // Helper function for padding numbers
  const pad = (num: number, length: number = 2): string => {
    const str = num.toString();
    if (str.length >= length) return str;
    const zeros = new Array(length - str.length + 1).join('0');
    return zeros + str;
  };

  if (hours > 0) {
    const h = hours.toString();
    const m = pad(minutes, 2);
    const s = pad(seconds, 2);
    return `${h}:${m}:${s}`;
  } else {
    const m = minutes.toString();
    const s = pad(seconds, 2);
    return `${m}:${s}`;
  }
}

function formatCourse(hours: number, minutes: number, seconds: number, config: DurationFormatConfig): string {
  const parts: string[] = [];
  
  if (hours > 0) {
    parts.push(hours === 1 ? '1 Hr' : `${hours} Hrs`);
  }
  if (minutes > 0) {
    parts.push(minutes === 1 ? '1 Min' : `${minutes} Min`);
  }
  // Course format typically doesn't show seconds unless specifically requested
  if (config.showSeconds && seconds > 0) {
    parts.push(seconds === 1 ? '1 Sec' : `${seconds} Sec`);
  }
  
  return parts.length > 0 ? parts.join(' ') : (config.zeroDisplay || 'Duration TBD');
}

/**
 * Legacy compatibility functions - use the main functions above for new code
 */

/**
 * @deprecated Use formatDurationFromSeconds(seconds, 'course') instead
 */
export function formatCourseDuration(hours?: number | null): string {
  return formatDurationFromHours(hours, 'course');
}

/**
 * @deprecated Use formatDurationFromSeconds(seconds, 'timestamp') instead
 */
export function formatDuration(seconds: number): string {
  return formatDurationFromSeconds(seconds, 'timestamp');
}
