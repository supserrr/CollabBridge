// Simple image test - Let me build a minimal working version first
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

export default function ManageEventsSimple() {
  const [imageUrls, setImageUrls] = useState<string[]>([])
  const [selectedImages, setSelectedImages] = useState<File[]>([])
  const [uploadingImages, setUploadingImages] = useState(false)

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (files.length === 0) return

    setSelectedImages(prev => [...prev, ...files])

    // Create preview URLs for new uploads
    files.forEach(file => {
      const reader = new FileReader()
      reader.onload = (e) => {
        if (e.target?.result) {
          setImageUrls(prev => [...prev, e.target!.result as string])
        }
      }
      reader.readAsDataURL(file)
    })
  }

  const removeImage = (index: number) => {
    setSelectedImages(prev => prev.filter((_, i) => i !== index))
    setImageUrls(prev => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Image Upload Test</h1>
      
      <div className="space-y-6">
        <div>
          <Label htmlFor="eventImages">Upload Images</Label>
          <Input
            id="eventImages"
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="mt-1"
          />
        </div>

        {imageUrls.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <img
                  src={url}
                  alt={`Image ${index + 1}`}
                  className="w-full h-32 object-cover rounded-lg border"
                />
                <button
                  onClick={() => removeImage(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
