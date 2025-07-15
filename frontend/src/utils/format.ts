import { format, formatDistanceToNow, isToday, isTomorrow, isYesterday } from 'date-fns';

// Date formatting
export const formatDate = (date: string | Date): string => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy');
};

export const formatDateTime = (date: string | Date): string => {
  const d = new Date(date);
  return format(d, 'MMM dd, yyyy h:mm a');
};

export const formatTime = (date: string | Date): string => {
  const d = new Date(date);
  return format(d, 'h:mm a');
};

// Relative time formatting
export const formatRelativeTime = (date: string | Date): string => {
  const d = new Date(date);
  
  if (isToday(d)) {
    return `Today at ${formatTime(d)}`;
  } else if (isTomorrow(d)) {
    return `Tomorrow at ${formatTime(d)}`;
  } else if (isYesterday(d)) {
    return `Yesterday at ${formatTime(d)}`;
  } else {
    return formatDistanceToNow(d, { addSuffix: true });
  }
};

// Currency formatting
export const formatCurrency = (amount: number, currency: string = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

// Number formatting
export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat().format(num);
};

// Compact number formatting (1.2K, 1.5M, etc.)
export const formatCompactNumber = (num: number): string => {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(num);
};

// File size formatting
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Capitalize first letter
export const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

// Convert camelCase to Title Case
export const camelToTitle = (str: string): string => {
  return str
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, char => char.toUpperCase())
    .trim();
};

// Truncate text
export const truncate = (text: string, length: number = 100): string => {
  if (text.length <= length) return text;
  return text.substring(0, length).trim() + '...';
};

// Generate initials from name
export const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

// Generate slug from title
export const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^\w ]+/g, '')
    .replace(/ +/g, '-');
};

// Parse JSON safely
export const safeJsonParse = <T>(json: string, fallback: T): T => {
  try {
    return JSON.parse(json);
  } catch {
    return fallback;
  }
};

// Debounce function
export const debounce = <T extends (...args: any[]) => any>(
  func: T,
  wait: number
): T => {
  let timeout: NodeJS.Timeout;
  return ((...args: any[]) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  }) as T;
};

// Throttle function
export const throttle = <T extends (...args: any[]) => any>(
  func: T,
  limit: number
): T => {
  let inThrottle: boolean;
  return ((...args: any[]) => {
    if (!inThrottle) {
      func.apply(null, args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  }) as T;
};
