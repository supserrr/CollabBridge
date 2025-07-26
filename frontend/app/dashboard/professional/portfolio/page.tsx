"use client"

import Image from 'next/image'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  Upload, 
  Save, 
  X,
  Image as ImageIcon,
  Video,
  FileText,
  Link,
  Star,
  Calendar,
  MapPin,
  DollarSign,
  MessageSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter
} from "@/components/ui/dialog";

interface PortfolioItem {
  id: string;
  title: string;
  description: string;
  category: string;
  mediaType: 'image' | 'video' | 'document';
  mediaUrl: string;
  thumbnailUrl?: string;
  tags: string[];
  isFeatured: boolean;
  createdAt: string;
  eventDetails?: {
    eventType: string;
    location: string;
    date: string;
    clientName?: string;
  };
  metrics?: {
    views: number;
    likes: number;
    inquiries: number;
  };
}

interface ProfileInfo {
  title: string;
  bio: string;
  hourlyRate: number;
  availability: 'available' | 'busy' | 'unavailable';
  skills: string[];
  experience: number;
  location: string;
}

export default function PortfolioManagement() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [profileInfo, setProfileInfo] = useState<ProfileInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [editingItem, setEditingItem] = useState<PortfolioItem | null>(null);
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [activeTab, setActiveTab] = useState("portfolio");

  const categories = [
    "Wedding Photography", "Corporate Events", "Music Production", 
    "Event Planning", "Floral Design", "Audio/Visual", "Lighting Design",
    "Catering", "Decoration", "Entertainment"
  ];

  useEffect(() => {
    fetchPortfolioData();
  }, []);

  const fetchPortfolioData = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const [portfolioRes, profileRes] = await Promise.all([
        fetch('/api/portfolio', {
          headers: { Authorization: `Bearer ${token}` }
        }),
        fetch('/api/profile', {
          headers: { Authorization: `Bearer ${token}` }
        })
      ]);

      const [portfolioData, profileData] = await Promise.all([
        portfolioRes.json(),
        profileRes.json()
      ]);

      setPortfolioItems(portfolioData);
      setProfileInfo(profileData);
    } catch (error) {
      console.error('Error fetching portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveItem = async (itemData: Partial<PortfolioItem>) => {
    try {
      const token = localStorage.getItem('authToken');
      const method = editingItem ? 'PUT' : 'POST';
      const url = editingItem ? `/api/portfolio/${editingItem.id}` : '/api/portfolio';

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(itemData)
      });

      if (response.ok) {
        fetchPortfolioData();
        setEditingItem(null);
        setIsAddingItem(false);
      }
    } catch (error) {
      console.error('Error saving portfolio item:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`/api/portfolio/${itemId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (response.ok) {
        setPortfolioItems(prev => prev.filter(item => item.id !== itemId));
      }
    } catch (error) {
      console.error('Error deleting portfolio item:', error);
    }
  };

  const toggleFeatured = async (itemId: string, isFeatured: boolean) => {
    try {
      const token = localStorage.getItem('authToken');
      await fetch(`/api/portfolio/${itemId}/featured`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ isFeatured })
      });

      setPortfolioItems(prev => 
        prev.map(item => 
          item.id === itemId ? { ...item, isFeatured } : item
        )
      );
    } catch (error) {
      console.error('Error updating featured status:', error);
    }
  };

  const updateProfile = async (profileData: Partial<ProfileInfo>) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const updatedProfile = await response.json();
        setProfileInfo(updatedProfile);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Portfolio Management</h1>
          <p className="text-muted-foreground">Showcase your work and manage your professional profile</p>
        </div>
        <Button onClick={() => setIsAddingItem(true)} className="gap-2">
          <Plus className="h-4 w-4" />
          Add Portfolio Item
        </Button>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="portfolio">Portfolio Items</TabsTrigger>
          <TabsTrigger value="profile">Profile Settings</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        {/* Portfolio Items Tab */}
        <TabsContent value="portfolio" className="space-y-6">
          {/* Featured Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">Featured Work</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems
                .filter(item => item.isFeatured)
                .map((item) => (
                  <PortfolioItemCard
                    key={item.id}
                    item={item}
                    onEdit={() => setEditingItem(item)}
                    onDelete={() => handleDeleteItem(item.id)}
                    onToggleFeatured={(featured) => toggleFeatured(item.id, featured)}
                  />
                ))}
            </div>
          </div>

          {/* All Items */}
          <div className="space-y-4">
            <h2 className="text-xl font-semibold">All Portfolio Items</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {portfolioItems.map((item) => (
                <PortfolioItemCard
                  key={item.id}
                  item={item}
                  onEdit={() => setEditingItem(item)}
                  onDelete={() => handleDeleteItem(item.id)}
                  onToggleFeatured={(featured) => toggleFeatured(item.id, featured)}
                />
              ))}
            </div>
          </div>

          {portfolioItems.length === 0 && (
            <div className="text-center py-12">
              <ImageIcon className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No portfolio items yet</h3>
              <p className="text-muted-foreground mb-4">Start building your portfolio by adding your first work sample</p>
              <Button onClick={() => setIsAddingItem(true)} className="gap-2">
                <Plus className="h-4 w-4" />
                Add Your First Item
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Profile Settings Tab */}
        <TabsContent value="profile" className="space-y-6">
          {profileInfo && (
            <ProfileSettingsForm
              profile={profileInfo}
              onUpdate={updateProfile}
            />
          )}
        </TabsContent>

        {/* Analytics Tab */}
        <TabsContent value="analytics" className="space-y-6">
          <PortfolioAnalytics portfolioItems={portfolioItems} />
        </TabsContent>
      </Tabs>

      {/* Add/Edit Item Dialog */}
      <PortfolioItemDialog
        item={editingItem}
        isOpen={isAddingItem || !!editingItem}
        onClose={() => {
          setEditingItem(null);
          setIsAddingItem(false);
        }}
        onSave={handleSaveItem}
        categories={categories}
      />
    </div>
  );
}

// Portfolio Item Card Component
function PortfolioItemCard({ 
  item, 
  onEdit, 
  onDelete, 
  onToggleFeatured 
}: {
  item: PortfolioItem;
  onEdit: () => void;
  onDelete: () => void;
  onToggleFeatured: (featured: boolean) => void;
}) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="group relative"
    >
      <Card className="overflow-hidden hover:shadow-lg transition-shadow">
        {/* Media Preview */}
        <div className="relative aspect-video bg-muted">
          {item.mediaType === 'image' ? (
            <img
              src={item.mediaUrl}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : item.mediaType === 'video' ? (
            <div className="w-full h-full flex items-center justify-center">
              <Video className="h-12 w-12 text-muted-foreground" />
            </div>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <FileText className="h-12 w-12 text-muted-foreground" />
            </div>
          )}
          
          {/* Featured Badge */}
          {item.isFeatured && (
            <Badge className="absolute top-2 left-2">
              <Star className="h-3 w-3 mr-1" />
              Featured
            </Badge>
          )}

          {/* Hover Actions */}
          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
            <Button size="sm" variant="secondary" onClick={onEdit}>
              <Edit className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="secondary">
              <Eye className="h-4 w-4" />
            </Button>
            <Button size="sm" variant="destructive" onClick={onDelete}>
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <CardContent className="p-4">
          <div className="space-y-2">
            <div className="flex items-start justify-between">
              <h3 className="font-semibold line-clamp-1">{item.title}</h3>
              <Switch
                checked={item.isFeatured}
                onCheckedChange={onToggleFeatured}
              />
            </div>
            
            <p className="text-sm text-muted-foreground line-clamp-2">
              {item.description}
            </p>
            
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                {item.category}
              </Badge>
              {item.tags.slice(0, 2).map(tag => (
                <Badge key={tag} variant="secondary" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>

            {item.metrics && (
              <div className="flex items-center gap-4 text-xs text-muted-foreground pt-2">
                <span>{item.metrics.views} views</span>
                <span>{item.metrics.likes} likes</span>
                <span>{item.metrics.inquiries} inquiries</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </motion.div>
  );
}

// Portfolio Item Dialog Component
function PortfolioItemDialog({
  item,
  isOpen,
  onClose,
  onSave,
  categories
}: {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PortfolioItem>) => void;
  categories: string[];
}) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    mediaType: "image" as "image" | "video" | "document",
    mediaUrl: "",
    tags: [] as string[],
    isFeatured: false
  });

  useEffect(() => {
    if (item) {
      setFormData({
        title: item.title,
        description: item.description,
        category: item.category,
        mediaType: item.mediaType,
        mediaUrl: item.mediaUrl,
        tags: item.tags,
        isFeatured: item.isFeatured
      });
    } else {
      setFormData({
        title: "",
        description: "",
        category: "",
        mediaType: "image" as "image" | "video" | "document",
        mediaUrl: "",
        tags: [],
        isFeatured: false
      });
    }
  }, [item, isOpen]);

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.category) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update your portfolio item details' : 'Add a new item to showcase your work'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Title */}
          <div className="space-y-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Enter project title..."
            />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Describe your work..."
              rows={4}
            />
          </div>

          {/* Category and Media Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Media Type</Label>
              <Select 
                value={formData.mediaType} 
                onValueChange={(value: 'image' | 'video' | 'document') => 
                  setFormData(prev => ({ ...prev, mediaType: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="image">Image</SelectItem>
                  <SelectItem value="video">Video</SelectItem>
                  <SelectItem value="document">Document</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Media Upload */}
          <div className="space-y-2">
            <Label>Media File</Label>
            <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6">
              <div className="text-center">
                <Upload className="h-10 w-10 mx-auto mb-4 text-muted-foreground" />
                <Button variant="outline">Choose File</Button>
                <p className="text-sm text-muted-foreground mt-2">
                  Upload images, videos, or documents
                </p>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Tags</Label>
            <Input
              placeholder="Enter tags separated by commas..."
              value={formData.tags.join(', ')}
              onChange={(e) => setFormData(prev => ({ 
                ...prev, 
                tags: e.target.value.split(',').map(tag => tag.trim()).filter(Boolean)
              }))}
            />
          </div>

          {/* Featured Toggle */}
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Featured Item</Label>
              <p className="text-sm text-muted-foreground">
                Featured items appear prominently on your profile
              </p>
            </div>
            <Switch
              checked={formData.isFeatured}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSubmit}>
            {item ? 'Update' : 'Add'} Item
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// Profile Settings Form Component
function ProfileSettingsForm({ 
  profile, 
  onUpdate 
}: { 
  profile: ProfileInfo;
  onUpdate: (data: Partial<ProfileInfo>) => void;
}) {
  const [formData, setFormData] = useState(profile);
  const [isEditing, setIsEditing] = useState(false);

  const handleSave = () => {
    onUpdate(formData);
    setIsEditing(false);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Profile Information</CardTitle>
          <Button
            variant={isEditing ? "default" : "outline"}
            onClick={isEditing ? handleSave : () => setIsEditing(true)}
            className="gap-2"
          >
            {isEditing ? (
              <>
                <Save className="h-4 w-4" />
                Save Changes
              </>
            ) : (
              <>
                <Edit className="h-4 w-4" />
                Edit Profile
              </>
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Professional Title */}
        <div className="space-y-2">
          <Label>Professional Title</Label>
          <Input
            value={formData.title}
            onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
            disabled={!isEditing}
            placeholder="e.g., Wedding Photographer"
          />
        </div>

        {/* Bio */}
        <div className="space-y-2">
          <Label>Bio</Label>
          <Textarea
            value={formData.bio}
            onChange={(e) => setFormData(prev => ({ ...prev, bio: e.target.value }))}
            disabled={!isEditing}
            rows={4}
            placeholder="Tell clients about yourself and your experience..."
          />
        </div>

        {/* Rate and Experience */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Hourly Rate ($)</Label>
            <Input
              type="number"
              value={formData.hourlyRate}
              onChange={(e) => setFormData(prev => ({ ...prev, hourlyRate: parseInt(e.target.value) }))}
              disabled={!isEditing}
            />
          </div>
          <div className="space-y-2">
            <Label>Years of Experience</Label>
            <Input
              type="number"
              value={formData.experience}
              onChange={(e) => setFormData(prev => ({ ...prev, experience: parseInt(e.target.value) }))}
              disabled={!isEditing}
            />
          </div>
        </div>

        {/* Location and Availability */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Location</Label>
            <Input
              value={formData.location}
              onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
              disabled={!isEditing}
              placeholder="City, State"
            />
          </div>
          <div className="space-y-2">
            <Label>Availability Status</Label>
            <Select 
              value={formData.availability} 
              onValueChange={(value: 'available' | 'busy' | 'unavailable') => 
                setFormData(prev => ({ ...prev, availability: value }))
              }
              disabled={!isEditing}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="available">Available</SelectItem>
                <SelectItem value="busy">Busy</SelectItem>
                <SelectItem value="unavailable">Unavailable</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Skills */}
        <div className="space-y-2">
          <Label>Skills & Specialties</Label>
          <Input
            value={formData.skills.join(', ')}
            onChange={(e) => setFormData(prev => ({ 
              ...prev, 
              skills: e.target.value.split(',').map(skill => skill.trim()).filter(Boolean)
            }))}
            disabled={!isEditing}
            placeholder="Enter skills separated by commas..."
          />
          <div className="flex flex-wrap gap-2 mt-2">
            {formData.skills.map(skill => (
              <Badge key={skill} variant="secondary">
                {skill}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

// Portfolio Analytics Component
function PortfolioAnalytics({ portfolioItems }: { portfolioItems: PortfolioItem[] }) {
  const totalViews = portfolioItems.reduce((sum, item) => sum + (item.metrics?.views || 0), 0);
  const totalLikes = portfolioItems.reduce((sum, item) => sum + (item.metrics?.likes || 0), 0);
  const totalInquiries = portfolioItems.reduce((sum, item) => sum + (item.metrics?.inquiries || 0), 0);
  const featuredItems = portfolioItems.filter(item => item.isFeatured).length;

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Items</CardTitle>
            <ImageIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{portfolioItems.length}</div>
            <p className="text-xs text-muted-foreground">
              {featuredItems} featured
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Views</CardTitle>
            <Eye className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalViews}</div>
            <p className="text-xs text-muted-foreground">
              Avg {Math.round(totalViews / Math.max(portfolioItems.length, 1))} per item
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Likes</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLikes}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalLikes / Math.max(totalViews, 1)) * 100)}% engagement rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Inquiries</CardTitle>
            <MessageSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalInquiries}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((totalInquiries / Math.max(totalViews, 1)) * 100)}% conversion rate
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Top Performing Items */}
      <Card>
        <CardHeader>
          <CardTitle>Top Performing Items</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {portfolioItems
              .sort((a, b) => (b.metrics?.views || 0) - (a.metrics?.views || 0))
              .slice(0, 5)
              .map((item, index) => (
                <div key={item.id} className="flex items-center gap-4 p-3 border rounded-lg">
                  <div className="text-sm font-medium text-muted-foreground w-8">
                    #{index + 1}
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{item.title}</p>
                    <p className="text-sm text-muted-foreground">{item.category}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{item.metrics?.views || 0} views</p>
                    <p className="text-sm text-muted-foreground">
                      {item.metrics?.likes || 0} likes
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
