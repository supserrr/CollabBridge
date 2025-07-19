import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useAuth } from '@/lib/auth/AuthContext'
import Layout from '@/components/layout/Layout'
import {
  StarIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  PencilIcon,
  TrashIcon,
  UserIcon,
  CalendarDaysIcon,
  CheckBadgeIcon
} from '@heroicons/react/24/outline'
import { StarIcon as StarIconSolid } from '@heroicons/react/24/solid'

interface Review {
  id: string
  reviewerId: string
  reviewerName: string
  reviewerImage?: string
  targetId: string
  targetName: string
  targetType: 'EVENT' | 'PROFESSIONAL'
  rating: number
  title: string
  comment: string
  createdAt: string
  updatedAt?: string
  isVerified: boolean
  helpful: number
  flagged: boolean
  response?: {
    comment: string
    createdAt: string
    author: string
  }
}

interface ReviewFilters {
  rating: string
  targetType: string
  dateRange: string
  isVerified: boolean
}

const ReviewsPage: React.FC = () => {
  const [reviews, setReviews] = useState<Review[]>([])
  const [myReviews, setMyReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'my-reviews' | 'write-review'>('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [filters, setFilters] = useState<ReviewFilters>({
    rating: '',
    targetType: '',
    dateRange: '',
    isVerified: false
  })
  const [showFilters, setShowFilters] = useState(false)
  const [showReviewForm, setShowReviewForm] = useState(false)

  const { user } = useAuth()

  // Mock reviews data
  const mockReviews: Review[] = [
    {
      id: '1',
      reviewerId: '1',
      reviewerName: 'Sarah Johnson',
      reviewerImage: '/users/sarah.jpg',
      targetId: '1',
      targetName: 'Alex Rivera Photography',
      targetType: 'PROFESSIONAL',
      rating: 5,
      title: 'Absolutely Amazing Wedding Photography!',
      comment: 'Alex captured our wedding day perfectly. The photos are stunning and we couldn\'t be happier. Professional, creative, and so easy to work with. Highly recommend!',
      createdAt: '2024-01-15T10:30:00Z',
      isVerified: true,
      helpful: 12,
      flagged: false,
      response: {
        comment: 'Thank you so much Sarah! It was an honor to capture your special day. Wishing you both all the best!',
        createdAt: '2024-01-16T09:15:00Z',
        author: 'Alex Rivera'
      }
    },
    {
      id: '2',
      reviewerId: '2',
      reviewerName: 'Michael Chen',
      targetId: '2',
      targetName: 'Spring Corporate Mixer',
      targetType: 'EVENT',
      rating: 4,
      title: 'Great networking event',
      comment: 'Well organized event with excellent networking opportunities. The venue was perfect and the catering was delicious. Would attend again next year.',
      createdAt: '2024-01-10T14:20:00Z',
      isVerified: true,
      helpful: 8,
      flagged: false
    },
    {
      id: '3',
      reviewerId: '3',
      reviewerName: 'Emily Davis',
      targetId: '3',
      targetName: 'Maya Patel Decorations',
      targetType: 'PROFESSIONAL',
      rating: 5,
      title: 'Transformed our venue beautifully',
      comment: 'Maya\'s attention to detail is incredible. She transformed our plain venue into a magical space. The floral arrangements were breathtaking and everything was set up perfectly.',
      createdAt: '2024-01-08T16:45:00Z',
      isVerified: true,
      helpful: 15,
      flagged: false
    },
    {
      id: '4',
      reviewerId: '4',
      reviewerName: 'David Thompson',
      targetId: '4',
      targetName: 'Summer Music Festival',
      targetType: 'EVENT',
      rating: 3,
      title: 'Good music, poor organization',
      comment: 'The performers were great but the event was poorly organized. Long lines, confusing layout, and not enough facilities. Music made up for it though.',
      createdAt: '2024-01-05T12:00:00Z',
      isVerified: false,
      helpful: 5,
      flagged: false
    }
  ]

  const mockMyReviews: Review[] = [
    {
      id: '5',
      reviewerId: user?.id || '5',
      reviewerName: user ? `${user.firstName} ${user.lastName}` : 'Current User',
      targetId: '5',
      targetName: 'Sophie Chen Makeup',
      targetType: 'PROFESSIONAL',
      rating: 5,
      title: 'Exceptional makeup artistry',
      comment: 'Sophie did an amazing job for our photoshoot. Professional, talented, and made everyone look fantastic. Will definitely book again.',
      createdAt: '2024-01-12T11:30:00Z',
      isVerified: true,
      helpful: 7,
      flagged: false
    }
  ]

  useEffect(() => {
    loadReviews()
  }, [])

  const loadReviews = async () => {
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000))
      setReviews(mockReviews)
      if (user) {
        setMyReviews(mockMyReviews)
      }
    } catch (error) {
      console.error('Error loading reviews:', error)
    } finally {
      setLoading(false)
    }
  }

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    }

    return (
      <div className="flex items-center">
        {[...Array(5)].map((_, i) => (
          <StarIconSolid
            key={i}
            className={`${sizeClasses[size]} ${
              i < rating ? 'text-yellow-400' : 'text-neutral-300'
            }`}
          />
        ))}
      </div>
    )
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  const handleHelpful = (reviewId: string) => {
    setReviews(reviews.map(review =>
      review.id === reviewId
        ? { ...review, helpful: review.helpful + 1 }
        : review
    ))
  }

  const handleDeleteReview = (reviewId: string) => {
    if (confirm('Are you sure you want to delete this review?')) {
      setMyReviews(myReviews.filter(review => review.id !== reviewId))
    }
  }

  const ReviewCard: React.FC<{ review: Review; isMyReview?: boolean }> = ({ review, isMyReview = false }) => (
    <div className="bg-white border border-neutral-200 rounded-lg p-6 hover:shadow-sm transition-shadow">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-start space-x-3 flex-1">
          <div className="w-10 h-10 bg-neutral-300 rounded-full flex items-center justify-center flex-shrink-0">
            {review.reviewerImage ? (
              <img 
                src={review.reviewerImage} 
                alt={review.reviewerName}
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <UserIcon className="h-6 w-6 text-neutral-600" />
            )}
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-neutral-900">{review.reviewerName}</h4>
              {review.isVerified && (
                <CheckBadgeIcon className="h-4 w-4 text-blue-500" title="Verified reviewer" />
              )}
            </div>
            <div className="flex items-center gap-2 mb-2">
              {renderStars(review.rating)}
              <span className="text-sm text-neutral-500">
                for {review.targetName}
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-neutral-100 text-neutral-800">
                {review.targetType === 'PROFESSIONAL' ? 'Professional' : 'Event'}
              </span>
            </div>
            <div className="flex items-center text-xs text-neutral-500">
              <CalendarDaysIcon className="h-3 w-3 mr-1" />
              {formatDate(review.createdAt)}
            </div>
          </div>
        </div>
        
        {isMyReview && (
          <div className="flex items-center gap-1">
            <button 
              className="p-1 text-neutral-400 hover:text-neutral-600"
              title="Edit review"
            >
              <PencilIcon className="h-4 w-4" />
            </button>
            <button 
              onClick={() => handleDeleteReview(review.id)}
              className="p-1 text-neutral-400 hover:text-red-600"
              title="Delete review"
            >
              <TrashIcon className="h-4 w-4" />
            </button>
          </div>
        )}
      </div>

      <div className="mb-4">
        <h5 className="font-medium text-neutral-900 mb-2">{review.title}</h5>
        <p className="text-neutral-700 leading-relaxed">{review.comment}</p>
      </div>

      {review.response && (
        <div className="bg-neutral-50 border border-neutral-200 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-sm font-medium text-neutral-900">Response from {review.response.author}</span>
            <span className="text-xs text-neutral-500">{formatDate(review.response.createdAt)}</span>
          </div>
          <p className="text-sm text-neutral-700">{review.response.comment}</p>
        </div>
      )}

      <div className="flex items-center justify-between">
        <button
          onClick={() => handleHelpful(review.id)}
          className="text-sm text-neutral-500 hover:text-neutral-700"
        >
          Helpful ({review.helpful})
        </button>
        
        <div className="flex items-center gap-2">
          <button className="text-sm text-neutral-500 hover:text-neutral-700">
            Report
          </button>
        </div>
      </div>
    </div>
  )

  const WriteReviewForm: React.FC = () => {
    const [formData, setFormData] = useState({
      targetType: 'PROFESSIONAL' as 'PROFESSIONAL' | 'EVENT',
      targetId: '',
      rating: 5,
      title: '',
      comment: ''
    })

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault()
      // Handle review submission
      console.log('Submitting review:', formData)
      setShowReviewForm(false)
    }

    return (
      <div className="bg-white border border-neutral-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-neutral-900 mb-6">Write a Review</h3>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Review Type
            </label>
            <select
              value={formData.targetType}
              onChange={(e) => setFormData({...formData, targetType: e.target.value as 'PROFESSIONAL' | 'EVENT'})}
              className="input w-full"
            >
              <option value="PROFESSIONAL">Professional</option>
              <option value="EVENT">Event</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Rating
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onClick={() => setFormData({...formData, rating: star})}
                  className="p-1"
                >
                  <StarIconSolid
                    className={`h-6 w-6 ${
                      star <= formData.rating ? 'text-yellow-400' : 'text-neutral-300'
                    }`}
                  />
                </button>
              ))}
              <span className="ml-2 text-sm text-neutral-600">
                {formData.rating} star{formData.rating !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Review Title
            </label>
            <input
              type="text"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
              placeholder="Summarize your experience"
              className="input w-full"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-neutral-700 mb-2">
              Your Review
            </label>
            <textarea
              value={formData.comment}
              onChange={(e) => setFormData({...formData, comment: e.target.value})}
              placeholder="Share details about your experience..."
              rows={4}
              className="input w-full resize-none"
              required
            />
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={() => setShowReviewForm(false)}
              className="btn btn-outline"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Submit Review
            </button>
          </div>
        </form>
      </div>
    )
  }

  if (loading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
            <p className="text-neutral-600">Loading reviews...</p>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-neutral-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">
              Reviews & Ratings
            </h1>
            <p className="text-xl text-neutral-600 max-w-2xl mx-auto">
              Read authentic reviews from event planners and professionals in our community.
            </p>
          </div>

          {/* Tabs */}
          <div className="bg-white border border-neutral-200 rounded-lg mb-8">
            <div className="border-b border-neutral-200">
              <nav className="flex">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`py-4 px-6 text-sm font-medium ${
                    activeTab === 'all'
                      ? 'text-primary-600 border-b-2 border-primary-600'
                      : 'text-neutral-500 hover:text-neutral-700'
                  }`}
                >
                  All Reviews
                </button>
                {user && (
                  <button
                    onClick={() => setActiveTab('my-reviews')}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === 'my-reviews'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    My Reviews
                  </button>
                )}
                {user && (
                  <button
                    onClick={() => setActiveTab('write-review')}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === 'write-review'
                        ? 'text-primary-600 border-b-2 border-primary-600'
                        : 'text-neutral-500 hover:text-neutral-700'
                    }`}
                  >
                    Write Review
                  </button>
                )}
              </nav>
            </div>

            {/* Tab Content */}
            <div className="p-6">
              {activeTab === 'all' && (
                <div>
                  {/* Search and Filters */}
                  <div className="mb-6">
                    <div className="flex flex-col md:flex-row gap-4 mb-4">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Search reviews..."
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                          className="input w-full"
                        />
                      </div>
                      <button
                        onClick={() => setShowFilters(!showFilters)}
                        className="btn btn-outline inline-flex items-center"
                      >
                        <FunnelIcon className="h-4 w-4 mr-2" />
                        Filters
                      </button>
                    </div>

                    {showFilters && (
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-neutral-50 rounded-lg">
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Rating
                          </label>
                          <select
                            value={filters.rating}
                            onChange={(e) => setFilters({...filters, rating: e.target.value})}
                            className="input w-full"
                          >
                            <option value="">All Ratings</option>
                            <option value="5">5 Stars</option>
                            <option value="4">4+ Stars</option>
                            <option value="3">3+ Stars</option>
                          </select>
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Type
                          </label>
                          <select
                            value={filters.targetType}
                            onChange={(e) => setFilters({...filters, targetType: e.target.value})}
                            className="input w-full"
                          >
                            <option value="">All Types</option>
                            <option value="PROFESSIONAL">Professionals</option>
                            <option value="EVENT">Events</option>
                          </select>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-neutral-700 mb-2">
                            Verified Only
                          </label>
                          <label className="flex items-center">
                            <input
                              type="checkbox"
                              checked={filters.isVerified}
                              onChange={(e) => setFilters({...filters, isVerified: e.target.checked})}
                              className="mr-2"
                            />
                            Show verified reviews only
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Reviews List */}
                  <div className="space-y-6">
                    {reviews.map((review) => (
                      <ReviewCard key={review.id} review={review} />
                    ))}
                  </div>
                </div>
              )}

              {activeTab === 'my-reviews' && user && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="text-lg font-semibold text-neutral-900">
                      Your Reviews ({myReviews.length})
                    </h3>
                    <button
                      onClick={() => setActiveTab('write-review')}
                      className="btn btn-primary"
                    >
                      Write New Review
                    </button>
                  </div>

                  <div className="space-y-6">
                    {myReviews.length > 0 ? (
                      myReviews.map((review) => (
                        <ReviewCard key={review.id} review={review} isMyReview={true} />
                      ))
                    ) : (
                      <div className="text-center py-12">
                        <StarIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                        <h3 className="text-lg font-medium text-neutral-900 mb-2">
                          No reviews yet
                        </h3>
                        <p className="text-neutral-600 mb-6">
                          Share your experience with the community by writing your first review.
                        </p>
                        <button
                          onClick={() => setActiveTab('write-review')}
                          className="btn btn-primary"
                        >
                          Write Your First Review
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'write-review' && user && (
                <WriteReviewForm />
              )}

              {!user && (activeTab === 'my-reviews' || activeTab === 'write-review') && (
                <div className="text-center py-12">
                  <UserIcon className="h-16 w-16 mx-auto mb-4 text-neutral-400" />
                  <h3 className="text-lg font-medium text-neutral-900 mb-2">
                    Please log in
                  </h3>
                  <p className="text-neutral-600 mb-6">
                    You need to be logged in to write or manage reviews.
                  </p>
                  <Link href="/auth/signin" className="btn btn-primary">
                    Log In
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default ReviewsPage
