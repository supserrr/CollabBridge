import React, { useState, useCallback } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Progress } from '@/components/ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Upload, 
  FileText, 
  CheckCircle, 
  Clock, 
  XCircle, 
  Shield, 
  AlertTriangle,
  Camera,
  FileImage,
  Trash2
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface Document {
  id: string;
  type: DocumentType;
  name: string;
  url: string;
  status: 'pending' | 'verified' | 'rejected';
  uploadedAt: string;
  verifiedAt?: string;
  rejectionReason?: string;
}

type DocumentType = 
  | 'government_id'
  | 'business_license'
  | 'insurance_certificate'
  | 'certification'
  | 'portfolio_sample'
  | 'tax_document'
  | 'background_check';

interface VerificationStatus {
  isVerified: boolean;
  verificationLevel: 'basic' | 'standard' | 'premium';
  completedSteps: string[];
  pendingSteps: string[];
  documents: Document[];
  score: number;
  lastUpdated: string;
}

const DOCUMENT_TYPES = [
  {
    id: 'government_id',
    label: 'Government ID',
    description: 'Valid government-issued photo ID (Driver\'s License, Passport, State ID)',
    required: true,
    maxFiles: 2
  },
  {
    id: 'business_license',
    label: 'Business License',
    description: 'Business registration or professional license',
    required: false,
    maxFiles: 3
  },
  {
    id: 'insurance_certificate',
    label: 'Insurance Certificate',
    description: 'Liability insurance or professional indemnity insurance',
    required: false,
    maxFiles: 2
  },
  {
    id: 'certification',
    label: 'Professional Certifications',
    description: 'Industry certifications, training certificates, or educational credentials',
    required: false,
    maxFiles: 5
  },
  {
    id: 'portfolio_sample',
    label: 'Portfolio Samples',
    description: 'High-quality samples of your work with client permission',
    required: true,
    maxFiles: 10
  },
  {
    id: 'tax_document',
    label: 'Tax Documents',
    description: 'Business tax returns or employment verification',
    required: false,
    maxFiles: 2
  },
  {
    id: 'background_check',
    label: 'Background Check',
    description: 'Criminal background check or reference letters',
    required: false,
    maxFiles: 3
  }
];

const VERIFICATION_LEVELS = {
  basic: {
    name: 'Basic Verification',
    requirements: ['government_id', 'portfolio_sample'],
    benefits: ['Verified badge', 'Basic trust indicators'],
    color: 'blue'
  },
  standard: {
    name: 'Standard Verification',
    requirements: ['government_id', 'portfolio_sample', 'business_license', 'insurance_certificate'],
    benefits: ['Enhanced profile visibility', 'Priority in search results', 'Client trust boost'],
    color: 'green'
  },
  premium: {
    name: 'Premium Verification',
    requirements: ['government_id', 'portfolio_sample', 'business_license', 'insurance_certificate', 'certification', 'background_check'],
    benefits: ['Maximum visibility', 'Premium member badge', 'Featured listings', 'Lower platform fees'],
    color: 'purple'
  }
};

export default function ProfessionalVerification() {
  const [status, setStatus] = useState<VerificationStatus>({
    isVerified: false,
    verificationLevel: 'basic',
    completedSteps: [],
    pendingSteps: ['government_id', 'portfolio_sample'],
    documents: [],
    score: 15,
    lastUpdated: new Date().toISOString()
  });
  
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [selectedFiles, setSelectedFiles] = useState<Record<string, File[]>>({});
  const { toast } = useToast();

  const handleFileSelect = useCallback((documentType: DocumentType, files: FileList | null) => {
    if (!files) return;

    const fileArray = Array.from(files);
    const docType = DOCUMENT_TYPES.find(dt => dt.id === documentType);
    const maxFiles = docType?.maxFiles || 1;

    if (fileArray.length > maxFiles) {
      toast({
        title: "Too many files",
        description: `You can only upload up to ${maxFiles} files for ${docType?.label}`,
        variant: "destructive"
      });
      return;
    }

    // Validate file types
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    const invalidFiles = fileArray.filter(file => !validTypes.includes(file.type));
    
    if (invalidFiles.length > 0) {
      toast({
        title: "Invalid file type",
        description: "Please upload only JPG, PNG, or PDF files",
        variant: "destructive"
      });
      return;
    }

    // Validate file sizes (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    const oversizedFiles = fileArray.filter(file => file.size > maxSize);
    
    if (oversizedFiles.length > 0) {
      toast({
        title: "File too large",
        description: "Please ensure all files are under 5MB",
        variant: "destructive"
      });
      return;
    }

    setSelectedFiles(prev => ({
      ...prev,
      [documentType]: fileArray
    }));
  }, [toast]);

  const uploadDocument = async (documentType: DocumentType) => {
    const files = selectedFiles[documentType];
    if (!files || files.length === 0) return;

    setUploading(prev => ({ ...prev, [documentType]: true }));

    try {
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', documentType);
        formData.append('category', 'verification');

        const response = await fetch('/api/uploads/verification-document', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('token')}`
          },
          body: formData
        });

        if (!response.ok) {
          throw new Error('Upload failed');
        }

        return response.json();
      });

      const results = await Promise.all(uploadPromises);
      
      // Update status with new documents
      const newDocuments: Document[] = results.map((result, index) => ({
        id: result.data.id,
        type: documentType,
        name: files[index].name,
        url: result.data.url,
        status: 'pending',
        uploadedAt: new Date().toISOString()
      }));

      setStatus(prev => ({
        ...prev,
        documents: [...prev.documents, ...newDocuments],
        pendingSteps: prev.pendingSteps.includes(documentType) 
          ? prev.pendingSteps.filter(step => step !== documentType)
          : prev.pendingSteps,
        score: Math.min(100, prev.score + 15)
      }));

      setSelectedFiles(prev => {
        const updated = { ...prev };
        delete updated[documentType];
        return updated;
      });

      toast({
        title: "Documents uploaded successfully",
        description: `${files.length} document(s) uploaded for verification`
      });

    } catch (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: "Please try again or contact support if the problem persists",
        variant: "destructive"
      });
    } finally {
      setUploading(prev => ({ ...prev, [documentType]: false }));
    }
  };

  const deleteDocument = async (documentId: string) => {
    try {
      const response = await fetch(`/api/uploads/verification-document/${documentId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error('Delete failed');
      }

      setStatus(prev => ({
        ...prev,
        documents: prev.documents.filter(doc => doc.id !== documentId),
        score: Math.max(0, prev.score - 10)
      }));

      toast({
        title: "Document deleted",
        description: "Document has been removed from verification"
      });

    } catch (error) {
      console.error('Delete error:', error);
      toast({
        title: "Delete failed",
        description: "Please try again or contact support",
        variant: "destructive"
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'verified':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-400" />;
    }
  };

  const getVerificationLevelBadge = (level: string) => {
    const config = VERIFICATION_LEVELS[level as keyof typeof VERIFICATION_LEVELS];
    return (
      <Badge 
        variant="outline"
        className={`${config.color === 'blue' ? 'border-blue-500 text-blue-700' : 
                    config.color === 'green' ? 'border-green-500 text-green-700' :
                    'border-purple-500 text-purple-700'}`}
      >
        <Shield className="h-3 w-3 mr-1" />
        {config.name}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Verification Overview */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Shield className="h-5 w-5" />
              <span>Professional Verification</span>
            </CardTitle>
            {status.isVerified && getVerificationLevelBadge(status.verificationLevel)}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Verification Progress</span>
              <span className="text-sm text-muted-foreground">{status.score}/100</span>
            </div>
            <Progress value={status.score} className="w-full" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{status.completedSteps.length}</div>
              <div className="text-sm text-blue-600">Completed Steps</div>
            </div>
            <div className="text-center p-4 bg-yellow-50 rounded-lg">
              <div className="text-2xl font-bold text-yellow-600">{status.pendingSteps.length}</div>
              <div className="text-sm text-yellow-600">Pending Steps</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{status.documents.length}</div>
              <div className="text-sm text-green-600">Documents Uploaded</div>
            </div>
          </div>

          {!status.isVerified && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Complete your verification to increase trust with clients and improve your profile visibility.
                Verified professionals get 3x more bookings on average.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Verification Levels */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Levels</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(VERIFICATION_LEVELS).map(([level, config]) => (
              <div 
                key={level}
                className={`p-4 rounded-lg border-2 ${
                  status.verificationLevel === level 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-200'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h3 className="font-semibold">{config.name}</h3>
                  {status.verificationLevel === level && (
                    <Badge variant="default">Current</Badge>
                  )}
                </div>
                <div className="space-y-2 text-sm">
                  <div>
                    <div className="font-medium mb-1">Requirements:</div>
                    <ul className="text-muted-foreground space-y-1">
                      {config.requirements.map(req => {
                        const docType = DOCUMENT_TYPES.find(dt => dt.id === req);
                        return (
                          <li key={req} className="flex items-center space-x-1">
                            {status.completedSteps.includes(req) ? (
                              <CheckCircle className="h-3 w-3 text-green-500" />
                            ) : (
                              <Clock className="h-3 w-3 text-gray-400" />
                            )}
                            <span>{docType?.label}</span>
                          </li>
                        );
                      })}
                    </ul>
                  </div>
                  <div>
                    <div className="font-medium mb-1">Benefits:</div>
                    <ul className="text-muted-foreground text-xs space-y-1">
                      {config.benefits.map(benefit => (
                        <li key={benefit}>• {benefit}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Document Upload */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Verification Documents</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {DOCUMENT_TYPES.map((docType) => {
            const userDocs = status.documents.filter(doc => doc.type === docType.id);
            const hasFiles = selectedFiles[docType.id as DocumentType]?.length > 0;
            const isUploading = uploading[docType.id];

            return (
              <div key={docType.id} className="border rounded-lg p-4">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <Label className="font-medium">{docType.label}</Label>
                      {docType.required && (
                        <Badge variant="outline" className="text-xs">Required</Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {docType.description}
                    </p>
                  </div>
                </div>

                {/* Existing Documents */}
                {userDocs.length > 0 && (
                  <div className="mb-4 space-y-2">
                    <Label className="text-sm font-medium">Uploaded Documents:</Label>
                    {userDocs.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <div className="flex items-center space-x-2">
                          {getStatusIcon(doc.status)}
                          <span className="text-sm">{doc.name}</span>
                          <Badge 
                            variant={doc.status === 'verified' ? 'default' : 
                                   doc.status === 'pending' ? 'secondary' : 'destructive'}
                            className="text-xs"
                          >
                            {doc.status}
                          </Badge>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => deleteDocument(doc.id)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}

                {/* File Upload */}
                <div className="space-y-3">
                  <div>
                    <Input
                      type="file"
                      multiple={docType.maxFiles > 1}
                      accept=".jpg,.jpeg,.png,.pdf"
                      onChange={(e) => handleFileSelect(docType.id as DocumentType, e.target.files)}
                      className="cursor-pointer"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Accepted formats: JPG, PNG, PDF. Max size: 5MB. 
                      {docType.maxFiles > 1 && ` Max ${docType.maxFiles} files.`}
                    </p>
                  </div>

                  {hasFiles && (
                    <div className="space-y-2">
                      <Label className="text-sm">Selected Files:</Label>
                      {selectedFiles[docType.id as DocumentType]?.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-blue-50 rounded text-sm">
                          <div className="flex items-center space-x-2">
                            <FileImage className="h-4 w-4" />
                            <span>{file.name}</span>
                            <span className="text-muted-foreground">
                              ({(file.size / 1024 / 1024).toFixed(1)}MB)
                            </span>
                          </div>
                        </div>
                      ))}
                      <Button
                        onClick={() => uploadDocument(docType.id as DocumentType)}
                        disabled={isUploading}
                        className="w-full"
                      >
                        {isUploading ? (
                          <>
                            <Upload className="mr-2 h-4 w-4 animate-spin" />
                            Uploading...
                          </>
                        ) : (
                          <>
                            <Upload className="mr-2 h-4 w-4" />
                            Upload {selectedFiles[docType.id as DocumentType]?.length} File(s)
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Verification Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Verification Guidelines</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold mb-2">Document Requirements</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Documents must be clear and legible</li>
                <li>• Photos should show all four corners</li>
                <li>• No documents older than 2 years</li>
                <li>• Personal information must match profile</li>
                <li>• Business documents must be current</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Processing Time</h4>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Basic verification: 1-2 business days</li>
                <li>• Standard verification: 3-5 business days</li>
                <li>• Premium verification: 5-7 business days</li>
                <li>• Background checks: 7-14 business days</li>
                <li>• You'll be notified of status changes</li>
              </ul>
            </div>
          </div>
          
          <Alert>
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Your documents are securely encrypted and only accessed by our verification team. 
              We never share your personal information with third parties.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}
