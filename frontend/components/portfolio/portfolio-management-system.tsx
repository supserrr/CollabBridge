import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  FolderPlus, 
  FileImage, 
  FileVideo, 
  FileText, 
  Upload, 
  Eye, 
  Edit, 
  Trash2, 
  Share2, 
  Download, 
  Star,
  Heart,
  MessageSquare,
  ExternalLink,
  Grid3X3,
  List,
  Filter,
  Search,
  Settings,
  Link,
  Plus
} from 'lucide-react';

interface PortfolioItem {
  id: string;
  title: string;
  description?: string;
  category: 'photo' | 'video' | 'design' | 'document' | 'audio' | 'other';
  tags: string[];
  fileUrl: string;
  thumbnailUrl?: string;
  fileType: string;
  fileSize: number;
  width?: number;
  height?: number;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  isPublic: boolean;
  isFeatured: boolean;
  likes: number;
  views: number;
  downloads: number;
  comments: Array<{
    id: string;
    userId: string;
    userName: string;
    content: string;
    createdAt: Date;
  }>;
  metadata?: any;
  order: number;
  collections: string[];
}

interface PortfolioCollection {
  id: string;
  name: string;
  description?: string;
  coverImage?: string;
  isPublic: boolean;
  items: PortfolioItem[];
  createdAt: Date;
  updatedAt: Date;
  tags: string[];
}

interface PortfolioStats {
  totalItems: number;
  totalViews: number;
  totalLikes: number;
  totalDownloads: number;
  totalCollections: number;
  categoryBreakdown: Record<string, number>;
  recentActivity: Array<{
    type: 'view' | 'like' | 'download' | 'comment';
    itemId: string;
    itemTitle: string;
    timestamp: Date;
    userName?: string;
  }>;
}

const CATEGORIES = [
  { value: 'photo', label: 'Photography', icon: FileImage, color: 'text-blue-500' },
  { value: 'video', label: 'Video', icon: FileVideo, color: 'text-purple-500' },
  { value: 'design', label: 'Design', icon: FileText, color: 'text-green-500' },
  { value: 'document', label: 'Document', icon: FileText, color: 'text-orange-500' },
  { value: 'audio', label: 'Audio', icon: FileText, color: 'text-red-500' },
  { value: 'other', label: 'Other', icon: FileText, color: 'text-gray-500' }
];

const VIEW_MODES = [
  { value: 'grid', label: 'Grid', icon: Grid3X3 },
  { value: 'list', label: 'List', icon: List }
];

export default function PortfolioManagementSystem() {
  const [portfolioItems, setPortfolioItems] = useState<PortfolioItem[]>([]);
  const [collections, setCollections] = useState<PortfolioCollection[]>([]);
  const [stats, setStats] = useState<PortfolioStats | null>(null);
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [showCollectionDialog, setShowCollectionDialog] = useState(false);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<PortfolioItem | null>(null);
  const [activeTab, setActiveTab] = useState('items');
  const [loading, setLoading] = useState(false);

  // Filters and search
  const [filters, setFilters] = useState({
    category: 'all',
    tags: [] as string[],
    isPublic: 'all',
    isFeatured: false,
    search: ''
  });

  // Upload form state
  const [uploadForm, setUploadForm] = useState({
    files: [] as File[],
    title: '',
    description: '',
    category: 'photo' as PortfolioItem['category'],
    tags: [] as string[],
    isPublic: true,
    collection: ''
  });

  // Collection form state
  const [collectionForm, setCollectionForm] = useState({
    name: '',
    description: '',
    isPublic: true,
    tags: [] as string[]
  });

  useEffect(() => {
    loadPortfolioData();
  }, [filters]);

  const loadPortfolioData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters.category !== 'all' && { category: filters.category },
        ...filters.tags.length && { tags: filters.tags.join(',') },
        ...filters.isPublic !== 'all' && { isPublic: filters.isPublic },
        ...filters.isFeatured && { isFeatured: 'true' },
        ...filters.search && { search: filters.search }
      });

      const [itemsResponse, collectionsResponse, statsResponse] = await Promise.all([
        fetch(`/api/portfolio/items?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/portfolio/collections', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/portfolio/stats', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (itemsResponse.ok) {
        const itemsData = await itemsResponse.json();
        setPortfolioItems(itemsData.data.items.map((item: any) => ({
          ...item,
          createdAt: new Date(item.createdAt),
          updatedAt: new Date(item.updatedAt)
        })));
      }

      if (collectionsResponse.ok) {
        const collectionsData = await collectionsResponse.json();
        setCollections(collectionsData.data.collections.map((collection: any) => ({
          ...collection,
          createdAt: new Date(collection.createdAt),
          updatedAt: new Date(collection.updatedAt)
        })));
      }

      if (statsResponse.ok) {
        const statsData = await statsResponse.json();
        setStats(statsData.data);
      }
    } catch (error) {
      console.error('Failed to load portfolio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async () => {
    if (uploadForm.files.length === 0) return;

    setLoading(true);
    try {
      const formData = new FormData();
      
      // Append files
      uploadForm.files.forEach((file, index) => {
        formData.append(`files`, file);
      });

      // Append metadata
      formData.append('title', uploadForm.title);
      formData.append('description', uploadForm.description);
      formData.append('category', uploadForm.category);
      formData.append('tags', JSON.stringify(uploadForm.tags));
      formData.append('isPublic', uploadForm.isPublic.toString());
      if (uploadForm.collection) {
        formData.append('collection', uploadForm.collection);
      }

      const response = await fetch('/api/portfolio/upload', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });

      if (response.ok) {
        await loadPortfolioData();
        setShowUploadDialog(false);
        resetUploadForm();
      }
    } catch (error) {
      console.error('Failed to upload files:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCollection = async () => {
    try {
      const response = await fetch('/api/portfolio/collections', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(collectionForm)
      });

      if (response.ok) {
        await loadPortfolioData();
        setShowCollectionDialog(false);
        resetCollectionForm();
      }
    } catch (error) {
      console.error('Failed to create collection:', error);
    }
  };

  const handleDeleteItem = async (itemId: string) => {
    try {
      const response = await fetch(`/api/portfolio/items/${itemId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadPortfolioData();
      }
    } catch (error) {
      console.error('Failed to delete item:', error);
    }
  };

  const handleToggleFeatured = async (itemId: string, isFeatured: boolean) => {
    try {
      const response = await fetch(`/api/portfolio/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isFeatured: !isFeatured })
      });

      if (response.ok) {
        await loadPortfolioData();
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleTogglePublic = async (itemId: string, isPublic: boolean) => {
    try {
      const response = await fetch(`/api/portfolio/items/${itemId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({ isPublic: !isPublic })
      });

      if (response.ok) {
        await loadPortfolioData();
      }
    } catch (error) {
      console.error('Failed to update item:', error);
    }
  };

  const handleBulkActions = async (action: 'delete' | 'makePublic' | 'makePrivate' | 'feature') => {
    if (selectedItems.length === 0) return;

    try {
      const response = await fetch('/api/portfolio/bulk-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          action,
          itemIds: selectedItems
        })
      });

      if (response.ok) {
        await loadPortfolioData();
        setSelectedItems([]);
      }
    } catch (error) {
      console.error('Failed to perform bulk action:', error);
    }
  };

  const resetUploadForm = () => {
    setUploadForm({
      files: [],
      title: '',
      description: '',
      category: 'photo',
      tags: [],
      isPublic: true,
      collection: ''
    });
  };

  const resetCollectionForm = () => {
    setCollectionForm({
      name: '',
      description: '',
      isPublic: true,
      tags: []
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (fileType: string) => {
    if (fileType.startsWith('image/')) return FileImage;
    if (fileType.startsWith('video/')) return FileVideo;
    return FileText;
  };

  const filteredItems = portfolioItems.filter(item => {
    if (filters.category !== 'all' && item.category !== filters.category) return false;
    if (filters.tags.length > 0 && !filters.tags.some(tag => item.tags.includes(tag))) return false;
    if (filters.isPublic !== 'all' && item.isPublic !== (filters.isPublic === 'true')) return false;
    if (filters.isFeatured && !item.isFeatured) return false;
    if (filters.search && !item.title.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const renderPortfolioGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
      {filteredItems.map(item => {
        const CategoryIcon = CATEGORIES.find(cat => cat.value === item.category)?.icon || FileText;
        const isSelected = selectedItems.includes(item.id);
        
        return (
          <Card key={item.id} className={`cursor-pointer transition-all hover:shadow-lg ${
            isSelected ? 'ring-2 ring-blue-500' : ''
          }`}>
            <CardContent className="p-0">
              {/* Item thumbnail/preview */}
              <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
                {item.thumbnailUrl ? (
                  <img 
                    src={item.thumbnailUrl} 
                    alt={item.title}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <CategoryIcon className="h-12 w-12 text-gray-400" />
                  </div>
                )}
                
                {/* Overlay actions */}
                <div className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-50 transition-all flex items-center justify-center opacity-0 hover:opacity-100">
                  <div className="flex space-x-2">
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(item.fileUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        setSelectedItem(item);
                        setShowShareDialog(true);
                      }}
                    >
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="secondary"
                      onClick={() => window.open(item.fileUrl, '_blank')}
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                {/* Selection checkbox */}
                <div className="absolute top-2 left-2">
                  <input
                    type="checkbox"
                    checked={isSelected}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedItems(prev => [...prev, item.id]);
                      } else {
                        setSelectedItems(prev => prev.filter(id => id !== item.id));
                      }
                    }}
                    className="rounded"
                  />
                </div>

                {/* Status badges */}
                <div className="absolute top-2 right-2 flex space-x-1">
                  {item.isFeatured && (
                    <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                      <Star className="h-3 w-3 mr-1" />
                      Featured
                    </Badge>
                  )}
                  {!item.isPublic && (
                    <Badge variant="secondary" className="bg-gray-100 text-gray-800">
                      Private
                    </Badge>
                  )}
                </div>
              </div>

              {/* Item details */}
              <div className="p-4">
                <h3 className="font-semibold text-lg mb-2 line-clamp-2">{item.title}</h3>
                
                <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                  <Badge variant="outline" className={CATEGORIES.find(cat => cat.value === item.category)?.color}>
                    {CATEGORIES.find(cat => cat.value === item.category)?.label}
                  </Badge>
                  <span>{formatFileSize(item.fileSize)}</span>
                </div>

                {item.description && (
                  <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                    {item.description}
                  </p>
                )}

                {/* Tags */}
                {item.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {item.tags.slice(0, 3).map(tag => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                    {item.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{item.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Stats */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1">
                      <Eye className="h-4 w-4" />
                      <span>{item.views}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Heart className="h-4 w-4" />
                      <span>{item.likes}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <Download className="h-4 w-4" />
                      <span>{item.downloads}</span>
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleFeatured(item.id, item.isFeatured)}
                    >
                      <Star className={`h-4 w-4 ${item.isFeatured ? 'text-yellow-500 fill-current' : ''}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderCollectionsGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {collections.map(collection => (
        <Card key={collection.id} className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative aspect-video bg-gray-100 rounded-t-lg overflow-hidden">
              {collection.coverImage ? (
                <img 
                  src={collection.coverImage} 
                  alt={collection.name}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <FolderPlus className="h-12 w-12 text-gray-400" />
                </div>
              )}
            </div>
            
            <div className="p-4">
              <h3 className="font-semibold text-lg mb-2">{collection.name}</h3>
              {collection.description && (
                <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                  {collection.description}
                </p>
              )}
              
              <div className="flex items-center justify-between text-sm text-muted-foreground">
                <span>{collection.items.length} items</span>
                <Badge variant={collection.isPublic ? "default" : "secondary"}>
                  {collection.isPublic ? 'Public' : 'Private'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileImage className="h-5 w-5" />
              <span>Portfolio Management</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Dialog open={showCollectionDialog} onOpenChange={setShowCollectionDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <FolderPlus className="h-4 w-4 mr-2" />
                    New Collection
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create New Collection</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="collectionName">Collection Name</Label>
                      <Input
                        id="collectionName"
                        value={collectionForm.name}
                        onChange={(e) => setCollectionForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter collection name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="collectionDescription">Description</Label>
                      <Textarea
                        id="collectionDescription"
                        value={collectionForm.description}
                        onChange={(e) => setCollectionForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter collection description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="collectionPublic"
                        checked={collectionForm.isPublic}
                        onChange={(e) => setCollectionForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="collectionPublic">Make collection public</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowCollectionDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleCreateCollection}>
                        Create Collection
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Upload className="h-4 w-4 mr-2" />
                    Upload Files
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-2xl">
                  <DialogHeader>
                    <DialogTitle>Upload Portfolio Items</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="files">Select Files</Label>
                      <Input
                        id="files"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setUploadForm(prev => ({ ...prev, files }));
                        }}
                        className="mt-1"
                      />
                      {uploadForm.files.length > 0 && (
                        <div className="mt-2 space-y-1">
                          {uploadForm.files.map((file, index) => (
                            <div key={index} className="text-sm text-muted-foreground">
                              {file.name} ({formatFileSize(file.size)})
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="uploadTitle">Title</Label>
                        <Input
                          id="uploadTitle"
                          value={uploadForm.title}
                          onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Enter title"
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="uploadCategory">Category</Label>
                        <Select 
                          value={uploadForm.category} 
                          onValueChange={(value) => setUploadForm(prev => ({ ...prev, category: value as any }))}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(category => (
                              <SelectItem key={category.value} value={category.value}>
                                {category.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="uploadDescription">Description</Label>
                      <Textarea
                        id="uploadDescription"
                        value={uploadForm.description}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="uploadPublic"
                        checked={uploadForm.isPublic}
                        onChange={(e) => setUploadForm(prev => ({ ...prev, isPublic: e.target.checked }))}
                        className="rounded"
                      />
                      <Label htmlFor="uploadPublic">Make items public</Label>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowUploadDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={handleFileUpload} disabled={uploadForm.files.length === 0}>
                        Upload Files
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Portfolio Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.totalItems}</div>
                <div className="text-sm text-muted-foreground">Total Items</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalViews}</div>
                <div className="text-sm text-muted-foreground">Total Views</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-red-600">{stats.totalLikes}</div>
                <div className="text-sm text-muted-foreground">Total Likes</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{stats.totalDownloads}</div>
                <div className="text-sm text-muted-foreground">Downloads</div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardContent className="p-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">{stats.totalCollections}</div>
                <div className="text-sm text-muted-foreground">Collections</div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="items">Portfolio Items</TabsTrigger>
                <TabsTrigger value="collections">Collections</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
                {/* Bulk actions */}
                {selectedItems.length > 0 && (
                  <div className="flex items-center space-x-2">
                    <Badge variant="secondary">{selectedItems.length} selected</Badge>
                    <Button variant="outline" size="sm" onClick={() => handleBulkActions('makePublic')}>
                      Make Public
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkActions('makePrivate')}>
                      Make Private
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleBulkActions('feature')}>
                      Feature
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleBulkActions('delete')}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}

                {/* View mode toggle */}
                <div className="flex space-x-1">
                  {VIEW_MODES.map((mode) => {
                    const Icon = mode.icon;
                    return (
                      <Button
                        key={mode.value}
                        variant={viewMode === mode.value ? "default" : "outline"}
                        size="sm"
                        onClick={() => setViewMode(mode.value as any)}
                      >
                        <Icon className="h-4 w-4" />
                      </Button>
                    );
                  })}
                </div>

                <Button variant="outline" size="sm">
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {/* Search and Filters */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search portfolio..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div>
                <Select 
                  value={filters.category} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {CATEGORIES.map(category => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={filters.isPublic} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, isPublic: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Items</SelectItem>
                    <SelectItem value="true">Public Only</SelectItem>
                    <SelectItem value="false">Private Only</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="featuredFilter"
                  checked={filters.isFeatured}
                  onChange={(e) => setFilters(prev => ({ ...prev, isFeatured: e.target.checked }))}
                  className="rounded"
                />
                <Label htmlFor="featuredFilter">Featured only</Label>
              </div>
            </div>

            <TabsContent value="items">
              {loading ? (
                <div className="text-center py-8">Loading portfolio items...</div>
              ) : (
                renderPortfolioGrid()
              )}
            </TabsContent>

            <TabsContent value="collections">
              {loading ? (
                <div className="text-center py-8">Loading collections...</div>
              ) : (
                renderCollectionsGrid()
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
