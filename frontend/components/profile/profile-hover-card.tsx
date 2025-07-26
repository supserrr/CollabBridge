'use client';

import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Star, MapPin, Calendar, DollarSign, Users, Heart, MessageCircle } from "lucide-react";
import { motion } from "framer-motion";

interface Professional {
  id: string;
  name: string;
  avatar: string;
  title: string;
  location: string;
  rating: number;
  reviewCount: number;
  hourlyRate: number;
  eventTypes: string[];
  experience: string;
  availability: string;
  completedProjects: number;
  responseTime: string;
  isVerified: boolean;
  tags: string[];
}

interface ProfileCardProps {
  professional: Professional;
  onFavorite?: (id: string) => void;
  onContact?: (id: string) => void;
  onViewProfile?: (id: string) => void;
  isFavorited?: boolean;
  className?: string;
}

export function ProfileCard({ 
  professional, 
  onFavorite, 
  onContact, 
  onViewProfile,
  isFavorited = false,
  className = ""
}: ProfileCardProps) {
  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: "0 12px 24px -4px rgba(0, 0, 0, 0.1)" }}
      transition={{ duration: 0.2 }}
      className={className}
    >
      <Card className="h-full hover:shadow-lg transition-all duration-200 border-muted">
        <CardContent className="p-4 sm:p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <Avatar className="h-12 w-12">
                <AvatarImage src={professional.avatar} alt={professional.name} />
                <AvatarFallback>{professional.name.split(' ').map(n => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-base sm:text-lg truncate">{professional.name}</h3>
                  {professional.isVerified && (
                    <Badge variant="secondary" className="text-xs">Verified</Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground truncate">{professional.title}</p>
                <div className="flex items-center gap-1 mt-1">
                  <MapPin className="h-3 w-3 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground truncate">{professional.location}</span>
                </div>
              </div>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onFavorite?.(professional.id)}
              className="text-muted-foreground hover:text-red-500 shrink-0"
            >
              <Heart className={`h-4 w-4 ${isFavorited ? 'fill-red-500 text-red-500' : ''}`} />
            </Button>
          </div>

          {/* Rating and Stats */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="text-sm font-medium">{professional.rating}</span>
                <span className="text-xs text-muted-foreground">({professional.reviewCount})</span>
              </div>
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">{professional.completedProjects} projects</span>
              </div>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-1">
                <DollarSign className="h-4 w-4 text-muted-foreground" />
                <span className="font-semibold text-sm sm:text-base">${professional.hourlyRate}/hr</span>
              </div>
            </div>
          </div>

          {/* Event Types */}
          <div className="mb-4">
            <div className="flex flex-wrap gap-1">
              {professional.eventTypes.slice(0, 3).map((type) => (
                <Badge key={type} variant="outline" className="text-xs">
                  {type}
                </Badge>
              ))}
              {professional.eventTypes.length > 3 && (
                <Badge variant="outline" className="text-xs">
                  +{professional.eventTypes.length - 3} more
                </Badge>
              )}
            </div>
          </div>

          {/* Experience and Availability */}
          <div className="text-xs text-muted-foreground mb-4 space-y-1">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              <span>{professional.experience} experience</span>
            </div>
            <div>Available: {professional.availability}</div>
            <div>Response time: {professional.responseTime}</div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => onViewProfile?.(professional.id)}
              className="flex-1 text-xs sm:text-sm"
            >
              View Profile
            </Button>
            <Button 
              size="sm" 
              onClick={() => onContact?.(professional.id)}
              className="flex-1 gap-1 text-xs sm:text-sm"
            >
              <MessageCircle className="h-3 w-3" />
              Contact
            </Button>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}
