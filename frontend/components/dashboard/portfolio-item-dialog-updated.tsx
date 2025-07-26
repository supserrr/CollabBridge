"use client"

import Image from 'next/image'

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter
} from "@/components/ui/dialog";
import { FileUpload } from "@/components/ui/file-upload";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

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
}

interface PortfolioItemDialogProps {
  item: PortfolioItem | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: Partial<PortfolioItem>) => void;
  categories: string[];
}

export function PortfolioItemDialog({
  item,
  isOpen,
  onClose,
  onSave,
  categories
}: PortfolioItemDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    mediaType: "image" as 'image' | 'video' | 'document',
    mediaUrl: "",
    tags: [] as string[],
    isFeatured: false
  });
  const [tagInput, setTagInput] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

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
        mediaType: "image",
        mediaUrl: "",
        tags: [],
        isFeatured: false
      });
    }
    setUploadedFiles([]);
  }, [item, isOpen]);

  const handleFileUpload = (files: File[]) => {
    setUploadedFiles(files);
    if (files.length > 0) {
      // In a real app, you'd upload to your server/cloud storage here
      const mockUrl = URL.createObjectURL(files[0]);
      setFormData(prev => ({ ...prev, mediaUrl: mockUrl }));
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !formData.tags.includes(tagInput.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, tagInput.trim()]
      }));
      setTagInput("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleSubmit = () => {
    if (formData.title && formData.description && formData.category) {
      onSave(formData);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {item ? 'Edit Portfolio Item' : 'Add Portfolio Item'}
          </DialogTitle>
          <DialogDescription>
            {item ? 'Update your portfolio item details' : 'Add a new item to showcase your work'}
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Form Fields */}
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

            {/* Tags */}
            <div className="space-y-2">
              <Label>Tags</Label>
              <div className="flex gap-2">
                <Input
                  placeholder="Add a tag"
                  value={tagInput}
                  onChange={(e) => setTagInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                />
                <Button type="button" onClick={addTag} variant="outline">
                  Add
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {formData.tags.map(tag => (
                  <Badge key={tag} variant="secondary" className="gap-1">
                    {tag}
                    <X 
                      className="h-3 w-3 cursor-pointer" 
                      onClick={() => removeTag(tag)}
                    />
                  </Badge>
                ))}
              </div>
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

          {/* Right Column - File Upload */}
          <div className="space-y-4">
            <div>
              <Label className="text-base font-medium">Media Upload</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Upload images, videos, or documents to showcase your work
              </p>
            </div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
            >
              <FileUpload onChange={handleFileUpload} />
            </motion.div>

            {/* File Preview */}
            {formData.mediaUrl && (
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="mt-4"
              >
                <Label className="text-sm font-medium">Preview</Label>
                <div className="mt-2 border rounded-lg p-4 bg-muted/20">
                  {formData.mediaType === 'image' ? (
                    <img
                      src={formData.mediaUrl}
                      alt="Preview"
                      className="w-full max-h-48 object-cover rounded"
                    />
                  ) : formData.mediaType === 'video' ? (
                    <video
                      src={formData.mediaUrl}
                      controls
                      className="w-full max-h-48 rounded"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-24 border-2 border-dashed border-muted-foreground/25 rounded">
                      <p className="text-sm text-muted-foreground">Document uploaded</p>
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Upload Guidelines */}
            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Maximum file size: 10MB</p>
              <p>• Supported formats: JPG, PNG, GIF, MP4, PDF</p>
              <p>• High-quality images showcase your work best</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex items-center justify-between pt-6">
          <div className="text-sm text-muted-foreground">
            {uploadedFiles.length > 0 && (
              <span>✓ {uploadedFiles.length} file(s) ready to upload</span>
            )}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={!formData.title || !formData.description || !formData.category}
            >
              {item ? 'Update' : 'Add'} Item
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
