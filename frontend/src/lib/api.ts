import axios, { AxiosResponse } from 'axios'
import { User, Event, Application, Booking, Review, Message, Conversation } from '@/types'

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken')
      window.location.href = '/auth/signin'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email: string, password: string): Promise<AxiosResponse<{ user: User; token: string }>> =>
    api.post('/auth/login', { email, password }),
  
  signup: (userData: any): Promise<AxiosResponse<{ user: User; token: string }>> =>
    api.post('/auth/signup', userData),
  
  logout: (): Promise<AxiosResponse> =>
    api.post('/auth/logout'),
  
  getProfile: (): Promise<AxiosResponse<User>> =>
    api.get('/auth/profile'),
  
  updateProfile: (data: Partial<User>): Promise<AxiosResponse<User>> =>
    api.put('/auth/profile', data),
    
  checkUser: (uid: string): Promise<AxiosResponse<{ exists: boolean }>> =>
    api.get(`/auth/user/${uid}`),
    
  googleSignIn: (userData: { uid: string; email: string; displayName: string; photoURL: string }): Promise<AxiosResponse<{ user: User; token: string }>> =>
    api.post('/auth/google', userData),
    
  googleSignup: (userData: { uid: string; email: string; displayName: string; photoURL: string; role: string; category?: string }): Promise<AxiosResponse<{ user: User; token: string }>> =>
    api.post('/auth/google-signup', userData),
}

// Events API
export const eventsAPI = {
  getEvents: (params?: any): Promise<AxiosResponse<{ events: Event[]; total: number }>> =>
    api.get('/events', { params }),
  
  getEvent: (id: string): Promise<AxiosResponse<Event>> =>
    api.get(`/events/${id}`),
  
  createEvent: (eventData: Partial<Event>): Promise<AxiosResponse<Event>> =>
    api.post('/events', eventData),
  
  updateEvent: (id: string, eventData: Partial<Event>): Promise<AxiosResponse<Event>> =>
    api.put(`/events/${id}`, eventData),
  
  deleteEvent: (id: string): Promise<AxiosResponse> =>
    api.delete(`/events/${id}`),
}

// Applications API
export const applicationsAPI = {
  applyToEvent: (eventId: string, applicationData: Partial<Application>): Promise<AxiosResponse<Application>> =>
    api.post(`/events/${eventId}/apply`, applicationData),
  
  getApplications: (eventId?: string): Promise<AxiosResponse<Application[]>> =>
    api.get('/applications', { params: { eventId } }),
  
  updateApplicationStatus: (id: string, status: string): Promise<AxiosResponse<Application>> =>
    api.put(`/applications/${id}`, { status }),
}

// Bookings API
export const bookingsAPI = {
  createBooking: (bookingData: Partial<Booking>): Promise<AxiosResponse<Booking>> =>
    api.post('/bookings', bookingData),
  
  getBookings: (): Promise<AxiosResponse<Booking[]>> =>
    api.get('/bookings'),
  
  updateBookingStatus: (id: string, status: string): Promise<AxiosResponse<Booking>> =>
    api.put(`/bookings/${id}`, { status }),
}

// Reviews API
export const reviewsAPI = {
  createReview: (reviewData: Partial<Review>): Promise<AxiosResponse<Review>> =>
    api.post('/reviews', reviewData),
  
  getReviews: (userId?: string): Promise<AxiosResponse<Review[]>> =>
    api.get('/reviews', { params: { userId } }),
}

// Messages API
export const messagesAPI = {
  getConversations: (): Promise<AxiosResponse<Conversation[]>> =>
    api.get('/messages/conversations'),
  
  getMessages: (conversationId: string): Promise<AxiosResponse<Message[]>> =>
    api.get(`/messages/conversations/${conversationId}`),
  
  sendMessage: (conversationId: string, content: string): Promise<AxiosResponse<Message>> =>
    api.post(`/messages/conversations/${conversationId}`, { content }),
  
  createConversation: (participantId: string): Promise<AxiosResponse<Conversation>> =>
    api.post('/messages/conversations', { participantId }),
}

// Search API
export const searchAPI = {
  searchProfessionals: (params: any): Promise<AxiosResponse<{ professionals: User[]; total: number }>> =>
    api.get('/search/professionals', { params }),
  
  searchEvents: (params: any): Promise<AxiosResponse<{ events: Event[]; total: number }>> =>
    api.get('/search/events', { params }),
}

// Upload API
export const uploadAPI = {
  uploadImage: (file: File): Promise<AxiosResponse<{ url: string }>> => {
    const formData = new FormData()
    formData.append('image', file)
    return api.post('/uploads/image', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

export default api
