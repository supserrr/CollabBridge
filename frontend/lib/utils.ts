import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric", 
    year: "numeric",
  }).format(new Date(date))
}

export function formatTime(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function formatDateTime(date: Date | string | number) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric", 
    minute: "2-digit",
    hour12: true,
  }).format(new Date(date))
}

export function capitalize(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1)
}

export function truncate(str: string, length: number) {
  return str.length > length ? `${str.substring(0, length)}...` : str
}

export function getInitials(name: string) {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2)
}

export function formatCurrency(amount: number, currency: string = "RWF") {
  return new Intl.NumberFormat("en-RW", {
    style: "currency",
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount)
}

export function formatNumber(num: number) {
  return new Intl.NumberFormat("en-US").format(num)
}

export function formatRating(rating: number) {
  return rating.toFixed(1)
}

export function getStatusColor(status: string) {
  switch (status.toLowerCase()) {
    case 'pending':
      return 'bg-yellow-100 text-yellow-800'
    case 'approved':
    case 'active':
    case 'confirmed':
      return 'bg-green-100 text-green-800'
    case 'rejected':
    case 'cancelled':
    case 'failed':
      return 'bg-red-100 text-red-800'
    case 'completed':
    case 'finished':
      return 'bg-blue-100 text-blue-800'
    case 'in-progress':
    case 'ongoing':
      return 'bg-purple-100 text-purple-800'
    case 'draft':
      return 'bg-gray-100 text-gray-800'
    default:
      return 'bg-gray-100 text-gray-800'
  }
}

export function getAvailabilityIcon(availability: string) {
  switch (availability.toLowerCase()) {
    case 'available':
      return '🟢'
    case 'busy':
      return '🟡'
    case 'unavailable':
      return '🔴'
    default:
      return '⚪'
  }
}

export function slugify(str: string) {
  return str
    .toLowerCase()
    .replace(/[^\w ]+/g, "")
    .replace(/ +/g, "-")
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout
  return (...args: Parameters<T>) => {
    clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => (inThrottle = false), limit)
    }
  }
}

export function generateId() {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export function isValidEmail(email: string) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string) {
  const phoneRegex = /^[\+]?[1-9][\d]{0,15}$/
  return phoneRegex.test(phone.replace(/\s/g, ""))
}

export function getFileExtension(filename: string) {
  return filename.slice(((filename.lastIndexOf(".") - 1) >>> 0) + 2)
}

export function bytesToSize(bytes: number) {
  const sizes = ["Bytes", "KB", "MB", "GB", "TB"]
  if (bytes === 0) return "0 Byte"
  const i = parseInt(String(Math.floor(Math.log(bytes) / Math.log(1024))))
  return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + " " + sizes[i]
}

export function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

export function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function groupBy<T>(array: T[], key: keyof T) {
  return array.reduce((groups, item) => {
    const group = item[key] as unknown as string
    groups[group] = groups[group] || []
    groups[group].push(item)
    return groups
  }, {} as Record<string, T[]>)
}

export function unique<T>(array: T[]): T[] {
  return [...new Set(array)]
}

export function pick<T, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach((key) => {
    if (key in obj) {
      result[key] = obj[key]
    }
  })
  return result
}

export function omit<T, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach((key) => {
    delete result[key]
  })
  return result
}

// Event status helpers
export function getEventStatus(event: any) {
  const now = new Date()
  const eventDate = new Date(event.date)
  
  if (eventDate < now) {
    return 'completed'
  } else if (eventDate.getTime() - now.getTime() < 24 * 60 * 60 * 1000) {
    return 'upcoming'
  } else {
    return 'planned'
  }
}

// Professional availability helpers
export function getAvailabilityStatus(professional: any) {
  // This would typically check against their calendar/bookings
  // For now, return a mock status
  const statuses = ['available', 'busy', 'unavailable']
  return statuses[Math.floor(Math.random() * statuses.length)]
}

// Pricing helpers
export function calculateEventBudget(services: any[]) {
  return services.reduce((total, service) => total + (service.price || 0), 0)
}

export function formatBudgetRange(min: number, max: number) {
  return `${formatCurrency(min)} - ${formatCurrency(max)}`
}

// Time helpers
export function getTimeUntilEvent(eventDate: Date | string) {
  const now = new Date()
  const event = new Date(eventDate)
  const diff = event.getTime() - now.getTime()
  
  if (diff < 0) return 'Event has passed'
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) {
    return `${days} day${days !== 1 ? 's' : ''}`
  } else if (hours > 0) {
    return `${hours} hour${hours !== 1 ? 's' : ''}`
  } else {
    return 'Less than an hour'
  }
}

// Validation helpers
export function validateEventForm(data: any) {
  const errors: Record<string, string> = {}
  
  if (!data.title?.trim()) {
    errors.title = 'Event title is required'
  }
  
  if (!data.date) {
    errors.date = 'Event date is required'
  }
  
  if (!data.location?.trim()) {
    errors.location = 'Event location is required'
  }
  
  if (!data.budget || data.budget <= 0) {
    errors.budget = 'Valid budget is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}

export function validateProfessionalForm(data: any) {
  const errors: Record<string, string> = {}
  
  if (!data.name?.trim()) {
    errors.name = 'Name is required'
  }
  
  if (!data.specialty?.trim()) {
    errors.specialty = 'Specialty is required'
  }
  
  if (!data.email?.trim() || !isValidEmail(data.email)) {
    errors.email = 'Valid email is required'
  }
  
  if (!data.phone?.trim() || !isValidPhone(data.phone)) {
    errors.phone = 'Valid phone number is required'
  }
  
  return {
    isValid: Object.keys(errors).length === 0,
    errors
  }
}