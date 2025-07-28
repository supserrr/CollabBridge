/**
 * Cloudinary Test Component
 * Use this to verify Cloudinary configuration and upload presets
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AlertCircle, CheckCircle, Upload, X } from 'lucide-react';
import { getCloudinaryStatus, uploadImageToCloudinary } from '@/lib/cloudinary-utils';

export default function CloudinaryTest() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadResult, setUploadResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const cloudinaryStatus = getCloudinaryStatus();
  
  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    }
  };
  
  const testUpload = async () => {
    if (!selectedFile) return;
    
    setUploading(true);
    setError(null);
    setUploadResult(null);
    
    try {
      const url = await uploadImageToCloudinary(selectedFile, {
        folder: 'test',
        uploadPreset: 'ml_default'
      });
      setUploadResult(url);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error';
      setError(errorMessage);
    } finally {
      setUploading(false);
    }
  };
  
  const clearTest = () => {
    setSelectedFile(null);
    setUploadResult(null);
    setError(null);
  };
  
  return (
    <div className="container mx-auto p-6 max-w-2xl">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Cloudinary Upload Test
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configuration Status */}
          <div className="space-y-3">
            <h3 className="font-medium">Configuration Status</h3>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                {cloudinaryStatus.configured ? (
                  <CheckCircle className="h-4 w-4 text-green-500" />
                ) : (
                  <AlertCircle className="h-4 w-4 text-red-500" />
                )}
                <span>Cloudinary Configuration:</span>
                <Badge variant={cloudinaryStatus.configured ? "default" : "destructive"}>
                  {cloudinaryStatus.configured ? 'Configured' : 'Missing'}
                </Badge>
              </div>
              
              {cloudinaryStatus.cloudName && (
                <div className="text-sm text-muted-foreground">
                  Cloud Name: <code className="bg-muted px-1 rounded">{cloudinaryStatus.cloudName}</code>
                </div>
              )}
              
              {cloudinaryStatus.issues.length > 0 && (
                <div className="text-sm text-red-600">
                  Issues: {cloudinaryStatus.issues.join(', ')}
                </div>
              )}
            </div>
          </div>
          
          {/* Upload Test */}
          <div className="space-y-3">
            <h3 className="font-medium">Upload Test</h3>
            
            <div className="space-y-3">
              <Input
                type="file"
                accept="image/*"
                onChange={handleFileSelect}
                disabled={!cloudinaryStatus.configured}
              />
              
              {selectedFile && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span>Selected: {selectedFile.name}</span>
                  <span>({(selectedFile.size / 1024 / 1024).toFixed(2)} MB)</span>
                </div>
              )}
              
              <div className="flex gap-2">
                <Button 
                  onClick={testUpload}
                  disabled={!selectedFile || uploading || !cloudinaryStatus.configured}
                  className="flex-1"
                >
                  {uploading ? 'Uploading...' : 'Test Upload'}
                </Button>
                
                {(selectedFile || uploadResult || error) && (
                  <Button variant="outline" onClick={clearTest}>
                    <X className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </div>
          
          {/* Results */}
          {uploadResult && (
            <div className="space-y-3">
              <h3 className="font-medium text-green-600">Upload Successful!</h3>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <p className="text-sm text-green-800 break-all">
                  URL: <a href={uploadResult} target="_blank" rel="noopener noreferrer" className="underline">
                    {uploadResult}
                  </a>
                </p>
              </div>
              <img 
                src={uploadResult} 
                alt="Uploaded test image" 
                className="max-w-full h-48 object-cover rounded border"
              />
            </div>
          )}
          
          {error && (
            <div className="space-y-3">
              <h3 className="font-medium text-red-600">Upload Failed</h3>
              <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                <p className="text-sm text-red-800">{error}</p>
              </div>
              
              {error.includes('Upload preset') && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                  <h4 className="font-medium text-blue-800 mb-2">How to fix this:</h4>
                  <ol className="text-sm text-blue-700 space-y-1 list-decimal list-inside">
                    <li>Go to your Cloudinary Console</li>
                    <li>Navigate to Settings → Upload</li>
                    <li>Create an unsigned upload preset named "ml_default"</li>
                    <li>Or change the preset name in the code to match your existing preset</li>
                  </ol>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
