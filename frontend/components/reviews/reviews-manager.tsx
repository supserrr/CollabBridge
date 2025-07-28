'use client';

import React, { useState, useEffect } from 'react';
import { Star, Calendar, User, MessageCircle, Award, Filter } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { useAuth } from '@/hooks/use-auth-firebase';
import { toast } from 'sonner';

interface Review {
  id: string;
  rating: number;
  comment: string;
  skills: string[];
  communication: number;
  professionalism: number;
  quality: number;
  createdAt: string;
  reviewer: {
    id: string;
    name: string;
    avatar?: string;
  };
  booking: {
    id: string;
    event: {
      title: string;
      eventType: string;
    };
  };
}

interface ReviewStats {
  averageRating: number;
  totalReviews: number;
  ratingDistribution: {
    1: number;
    2: number;
    3: number;
    4: number;
    5: number;
  };
  skillsRatings: {
    communication: number;
    professionalism: number;
    quality: number;
  };
}

interface ReviewsManagerProps {
  userId?: string;
  showCreateReview?: boolean;
}

export function ReviewsManager({ userId, showCreateReview = false }: ReviewsManagerProps) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<ReviewStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newReview, setNewReview] = useState({
    bookingId: '',
    rating: 5,
    comment: '',
    communication: 5,
    professionalism: 5,
    quality: 5,
    skills: [] as string[]
  });

  useEffect(() => {
    loadReviews();
    loadStats();
  }, [userId, filter]);

  const loadReviews = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const params = new URLSearchParams({
        userId: targetUserId,
        page: '1',
        limit: '20'
      });

      if (filter !== 'all') {
        params.append('rating', filter);
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setReviews(data.reviews || []);
      }
    } catch (error) {
      console.error('Error loading reviews:', error);
      toast.error('Failed to load reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      const targetUserId = userId || user?.id;
      
      if (!targetUserId) return;

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews/stats/${targetUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error loading review stats:', error);
    }
  };

  const createReview = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      
      if (!newReview.bookingId || !newReview.comment.trim()) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/reviews`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(newReview),
      });

      if (response.ok) {
        toast.success('Review submitted successfully!');
        setIsCreateDialogOpen(false);
        setNewReview({
          bookingId: '',
          rating: 5,
          comment: '',
          communication: 5,
          professionalism: 5,
          quality: 5,
          skills: []
        });
        loadReviews();
        loadStats();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to submit review');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to submit review');
    }
  };

  const renderStars = (rating: number, size: 'sm' | 'md' | 'lg' = 'md') => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${sizeClasses[size]} ${
              star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
            }`}
          />
        ))}
      </div>
    );
  };

  const renderInteractiveStars = (
    rating: number, 
    onChange: (rating: number) => void,
    size: 'sm' | 'md' | 'lg' = 'md'
  ) => {
    const sizeClasses = {
      sm: 'h-3 w-3',
      md: 'h-4 w-4',
      lg: 'h-5 w-5'
    };

    return (
      <div className="flex items-center gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            className="transition-colors hover:scale-110"
          >
            <Star
              className={`${sizeClasses[size]} ${
                star <= rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300 hover:text-yellow-200'
              }`}
            />
          </button>
        ))}
      </div>
    );
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-48">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Review Stats */}
      {stats && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5" />
              Review Summary
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-3xl font-bold">{stats.averageRating.toFixed(1)}</div>
                <div className="flex justify-center my-2">
                  {renderStars(Math.round(stats.averageRating), 'lg')}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stats.totalReviews} review{stats.totalReviews !== 1 ? 's' : ''}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Rating Distribution</h4>
                <div className="space-y-2">
                  {[5, 4, 3, 2, 1].map((rating) => (
                    <div key={rating} className="flex items-center gap-2 text-sm">
                      <span className="w-2">{rating}</span>
                      <Star className="h-3 w-3 text-yellow-400" />
                      <div className="flex-1 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-yellow-400 h-2 rounded-full"
                          style={{
                            width: `${((stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0) / stats.totalReviews) * 100}%`
                          }}
                        />
                      </div>
                      <span className="w-8 text-right">
                        {stats.ratingDistribution[rating as keyof typeof stats.ratingDistribution] || 0}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-3">Skills Breakdown</h4>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Communication</span>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(stats.skillsRatings.communication), 'sm')}
                      <span className="text-sm font-medium">
                        {stats.skillsRatings.communication.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Professionalism</span>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(stats.skillsRatings.professionalism), 'sm')}
                      <span className="text-sm font-medium">
                        {stats.skillsRatings.professionalism.toFixed(1)}
                      </span>
                    </div>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm">Quality</span>
                    <div className="flex items-center gap-2">
                      {renderStars(Math.round(stats.skillsRatings.quality), 'sm')}
                      <span className="text-sm font-medium">
                        {stats.skillsRatings.quality.toFixed(1)}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Reviews List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="h-5 w-5" />
              Reviews
            </CardTitle>
            <div className="flex items-center gap-2">
              {showCreateReview && (
                <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                  <DialogTrigger asChild>
                    <Button>Write Review</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Write a Review</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label>Overall Rating</Label>
                        {renderInteractiveStars(newReview.rating, (rating) => 
                          setNewReview(prev => ({ ...prev, rating }))
                        )}
                      </div>

                      <div className="grid grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label>Communication</Label>
                          {renderInteractiveStars(newReview.communication, (rating) => 
                            setNewReview(prev => ({ ...prev, communication: rating }))
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Professionalism</Label>
                          {renderInteractiveStars(newReview.professionalism, (rating) => 
                            setNewReview(prev => ({ ...prev, professionalism: rating }))
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>Quality</Label>
                          {renderInteractiveStars(newReview.quality, (rating) => 
                            setNewReview(prev => ({ ...prev, quality: rating }))
                          )}
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label>Comment *</Label>
                        <Textarea
                          value={newReview.comment}
                          onChange={(e) => setNewReview(prev => ({ ...prev, comment: e.target.value }))}
                          placeholder="Share your experience working with this professional..."
                          rows={4}
                        />
                      </div>

                      <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                          Cancel
                        </Button>
                        <Button onClick={createReview}>
                          Submit Review
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              )}

              <Select value={filter} onValueChange={setFilter}>
                <SelectTrigger className="w-32">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Reviews</SelectItem>
                  <SelectItem value="5">5 Stars</SelectItem>
                  <SelectItem value="4">4 Stars</SelectItem>
                  <SelectItem value="3">3 Stars</SelectItem>
                  <SelectItem value="2">2 Stars</SelectItem>
                  <SelectItem value="1">1 Star</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {reviews.length === 0 ? (
            <div className="text-center py-8">
              <MessageCircle className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No reviews yet</h3>
              <p className="text-muted-foreground">
                Reviews from completed projects will appear here.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={review.reviewer.avatar} />
                        <AvatarFallback>
                          {review.reviewer.name.charAt(0).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h4 className="font-semibold">{review.reviewer.name}</h4>
                        <div className="flex items-center gap-2">
                          {renderStars(review.rating)}
                          <span className="text-sm text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">
                      {review.booking.event.title}
                    </Badge>
                  </div>

                  <p className="text-sm mb-3">{review.comment}</p>

                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1">
                      <span>Communication:</span>
                      {renderStars(review.communication, 'sm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Professionalism:</span>
                      {renderStars(review.professionalism, 'sm')}
                    </div>
                    <div className="flex items-center gap-1">
                      <span>Quality:</span>
                      {renderStars(review.quality, 'sm')}
                    </div>
                  </div>

                  {review.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-3">
                      {review.skills.map((skill, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
