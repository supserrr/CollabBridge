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
  FileText, 
  Plus, 
  Edit, 
  Trash2, 
  Download, 
  Send, 
  Eye, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertTriangle,
  Users,
  Calendar,
  DollarSign,
  Search,
  Filter,
  Settings,
  Briefcase,
  Shield,
  PenTool,
  FileSignature
} from 'lucide-react';

interface Contract {
  id: string;
  title: string;
  description?: string;
  type: 'service_agreement' | 'nda' | 'freelance' | 'licensing' | 'partnership' | 'employment' | 'custom';
  status: 'draft' | 'sent' | 'pending_signature' | 'signed' | 'completed' | 'cancelled' | 'expired';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  
  // Parties involved
  clientId?: string;
  clientName: string;
  clientEmail: string;
  clientOrganization?: string;
  
  // Contract details
  startDate?: Date;
  endDate?: Date;
  value?: number;
  currency: string;
  paymentTerms?: string;
  deliverables: string[];
  
  // Legal details
  jurisdiction: string;
  governingLaw: string;
  disputeResolution: 'mediation' | 'arbitration' | 'court';
  
  // Document management
  templateId?: string;
  documentUrl?: string;
  signedDocumentUrl?: string;
  version: number;
  
  // Workflow
  createdBy: string;
  assignedTo?: string;
  sentAt?: Date;
  signedAt?: Date;
  expiresAt?: Date;
  
  // Tracking
  signatures: Array<{
    id: string;
    signerName: string;
    signerEmail: string;
    signerRole: string;
    signedAt?: Date;
    ipAddress?: string;
    status: 'pending' | 'signed' | 'declined';
  }>;
  
  revisions: Array<{
    id: string;
    version: number;
    changes: string;
    createdAt: Date;
    createdBy: string;
  }>;
  
  comments: Array<{
    id: string;
    content: string;
    createdBy: string;
    createdAt: Date;
    isInternal: boolean;
  }>;
  
  // Metadata
  tags: string[];
  attachments: Array<{
    id: string;
    name: string;
    url: string;
    type: string;
    size: number;
  }>;
  
  createdAt: Date;
  updatedAt: Date;
}

interface ContractTemplate {
  id: string;
  name: string;
  description: string;
  type: Contract['type'];
  content: string;
  variables: Array<{
    name: string;
    label: string;
    type: 'text' | 'number' | 'date' | 'email' | 'select';
    required: boolean;
    defaultValue?: string;
    options?: string[];
  }>;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

interface LegalSettings {
  defaultJurisdiction: string;
  defaultGoverningLaw: string;
  defaultDisputeResolution: Contract['disputeResolution'];
  companyName: string;
  companyAddress: string;
  companyEmail: string;
  defaultCurrency: string;
  signatureProvider: 'docusign' | 'hellosign' | 'adobe_sign' | 'internal';
  autoReminders: boolean;
  reminderDays: number[];
}

const CONTRACT_TYPES = [
  { value: 'service_agreement', label: 'Service Agreement', icon: Briefcase },
  { value: 'nda', label: 'Non-Disclosure Agreement', icon: Shield },
  { value: 'freelance', label: 'Freelance Contract', icon: Users },
  { value: 'licensing', label: 'Licensing Agreement', icon: FileText },
  { value: 'partnership', label: 'Partnership Agreement', icon: Users },
  { value: 'employment', label: 'Employment Contract', icon: Briefcase },
  { value: 'custom', label: 'Custom Contract', icon: FileText }
];

const CONTRACT_STATUSES = [
  { value: 'draft', label: 'Draft', color: 'bg-gray-500', icon: Edit },
  { value: 'sent', label: 'Sent', color: 'bg-blue-500', icon: Send },
  { value: 'pending_signature', label: 'Pending Signature', color: 'bg-yellow-500', icon: PenTool },
  { value: 'signed', label: 'Signed', color: 'bg-green-500', icon: CheckCircle },
  { value: 'completed', label: 'Completed', color: 'bg-purple-500', icon: CheckCircle },
  { value: 'cancelled', label: 'Cancelled', color: 'bg-red-500', icon: XCircle },
  { value: 'expired', label: 'Expired', color: 'bg-orange-500', icon: AlertTriangle }
];

const PRIORITY_LEVELS = [
  { value: 'low', label: 'Low', color: 'text-gray-500' },
  { value: 'medium', label: 'Medium', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-orange-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-red-500' }
];

export default function ContractLegalDocumentSystem() {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [templates, setTemplates] = useState<ContractTemplate[]>([]);
  const [selectedContract, setSelectedContract] = useState<Contract | null>(null);
  const [showContractDialog, setShowContractDialog] = useState(false);
  const [showTemplateDialog, setShowTemplateDialog] = useState(false);
  const [showSignDialog, setShowSignDialog] = useState(false);
  const [activeTab, setActiveTab] = useState('contracts');
  const [loading, setLoading] = useState(false);

  // Filters and search
  const [filters, setFilters] = useState({
    status: 'all',
    type: 'all',
    priority: 'all',
    search: '',
    dateRange: {
      start: '',
      end: ''
    }
  });

  // Contract form state
  const [contractForm, setContractForm] = useState<Partial<Contract>>({
    title: '',
    description: '',
    type: 'service_agreement',
    status: 'draft',
    priority: 'medium',
    clientName: '',
    clientEmail: '',
    clientOrganization: '',
    value: 0,
    currency: 'USD',
    paymentTerms: '',
    deliverables: [],
    jurisdiction: 'United States',
    governingLaw: 'State of California',
    disputeResolution: 'arbitration',
    tags: []
  });

  // Template form state
  const [templateForm, setTemplateForm] = useState<Partial<ContractTemplate>>({
    name: '',
    description: '',
    type: 'service_agreement',
    content: '',
    variables: [],
    isActive: true
  });

  useEffect(() => {
    loadContractsData();
  }, [filters]);

  const loadContractsData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        ...filters.status !== 'all' && { status: filters.status },
        ...filters.type !== 'all' && { type: filters.type },
        ...filters.priority !== 'all' && { priority: filters.priority },
        ...filters.search && { search: filters.search },
        ...filters.dateRange.start && { startDate: filters.dateRange.start },
        ...filters.dateRange.end && { endDate: filters.dateRange.end }
      });

      const [contractsResponse, templatesResponse] = await Promise.all([
        fetch(`/api/contracts?${params}`, {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        }),
        fetch('/api/contracts/templates', {
          headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
        })
      ]);

      if (contractsResponse.ok) {
        const contractsData = await contractsResponse.json();
        setContracts(contractsData.data.contracts.map((contract: any) => ({
          ...contract,
          startDate: contract.startDate ? new Date(contract.startDate) : null,
          endDate: contract.endDate ? new Date(contract.endDate) : null,
          sentAt: contract.sentAt ? new Date(contract.sentAt) : null,
          signedAt: contract.signedAt ? new Date(contract.signedAt) : null,
          expiresAt: contract.expiresAt ? new Date(contract.expiresAt) : null,
          createdAt: new Date(contract.createdAt),
          updatedAt: new Date(contract.updatedAt)
        })));
      }

      if (templatesResponse.ok) {
        const templatesData = await templatesResponse.json();
        setTemplates(templatesData.data.templates.map((template: any) => ({
          ...template,
          createdAt: new Date(template.createdAt),
          updatedAt: new Date(template.updatedAt)
        })));
      }
    } catch (error) {
      console.error('Failed to load contracts data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateContract = async () => {
    try {
      const response = await fetch('/api/contracts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contractForm)
      });

      if (response.ok) {
        await loadContractsData();
        setShowContractDialog(false);
        resetContractForm();
      }
    } catch (error) {
      console.error('Failed to create contract:', error);
    }
  };

  const handleUpdateContract = async () => {
    if (!selectedContract) return;

    try {
      const response = await fetch(`/api/contracts/${selectedContract.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(contractForm)
      });

      if (response.ok) {
        await loadContractsData();
        setShowContractDialog(false);
        setSelectedContract(null);
        resetContractForm();
      }
    } catch (error) {
      console.error('Failed to update contract:', error);
    }
  };

  const handleDeleteContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadContractsData();
        setSelectedContract(null);
      }
    } catch (error) {
      console.error('Failed to delete contract:', error);
    }
  };

  const handleSendContract = async (contractId: string) => {
    try {
      const response = await fetch(`/api/contracts/${contractId}/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (response.ok) {
        await loadContractsData();
      }
    } catch (error) {
      console.error('Failed to send contract:', error);
    }
  };

  const handleGenerateFromTemplate = async (templateId: string) => {
    try {
      const response = await fetch(`/api/contracts/generate-from-template`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          templateId,
          variables: contractForm
        })
      });

      if (response.ok) {
        const data = await response.json();
        setContractForm(prev => ({
          ...prev,
          ...data.data.contract
        }));
      }
    } catch (error) {
      console.error('Failed to generate contract from template:', error);
    }
  };

  const resetContractForm = () => {
    setContractForm({
      title: '',
      description: '',
      type: 'service_agreement',
      status: 'draft',
      priority: 'medium',
      clientName: '',
      clientEmail: '',
      clientOrganization: '',
      value: 0,
      currency: 'USD',
      paymentTerms: '',
      deliverables: [],
      jurisdiction: 'United States',
      governingLaw: 'State of California',
      disputeResolution: 'arbitration',
      tags: []
    });
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount);
  };

  const getStatusBadge = (status: Contract['status']) => {
    const statusConfig = CONTRACT_STATUSES.find(s => s.value === status);
    if (!statusConfig) return null;

    const Icon = statusConfig.icon;
    return (
      <Badge className={`${statusConfig.color} text-white`}>
        <Icon className="h-3 w-3 mr-1" />
        {statusConfig.label}
      </Badge>
    );
  };

  const getDaysUntilExpiry = (expiresAt: Date | null | undefined) => {
    if (!expiresAt) return null;
    const now = new Date();
    const diffTime = expiresAt.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const filteredContracts = contracts.filter(contract => {
    if (filters.status !== 'all' && contract.status !== filters.status) return false;
    if (filters.type !== 'all' && contract.type !== filters.type) return false;
    if (filters.priority !== 'all' && contract.priority !== filters.priority) return false;
    if (filters.search && !contract.title.toLowerCase().includes(filters.search.toLowerCase()) && 
        !contract.clientName.toLowerCase().includes(filters.search.toLowerCase())) return false;
    return true;
  });

  const renderContractsGrid = () => (
    <div className="space-y-4">
      {filteredContracts.map(contract => {
        const typeConfig = CONTRACT_TYPES.find(t => t.value === contract.type);
        const daysUntilExpiry = getDaysUntilExpiry(contract.expiresAt);
        
        return (
          <Card key={contract.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-3 mb-3">
                    {getStatusBadge(contract.status)}
                    
                    <Badge variant="outline" className={PRIORITY_LEVELS.find(p => p.value === contract.priority)?.color}>
                      {PRIORITY_LEVELS.find(p => p.value === contract.priority)?.label}
                    </Badge>
                    
                    {typeConfig && (
                      <Badge variant="outline">
                        {typeConfig.label}
                      </Badge>
                    )}
                    
                    {daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0 && (
                      <Badge variant="destructive">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Expires in {daysUntilExpiry} days
                      </Badge>
                    )}
                  </div>
                  
                  <h3 className="font-semibold text-lg mb-2">{contract.title}</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-muted-foreground mb-3">
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4" />
                      <span>{contract.clientName}</span>
                      {contract.clientOrganization && (
                        <span className="text-xs">({contract.clientOrganization})</span>
                      )}
                    </div>
                    
                    {contract.value && contract.value > 0 && (
                      <div className="flex items-center space-x-2">
                        <DollarSign className="h-4 w-4" />
                        <span>{formatCurrency(contract.value, contract.currency)}</span>
                      </div>
                    )}
                    
                    {contract.endDate && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {contract.endDate.toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                  
                  {contract.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                      {contract.description}
                    </p>
                  )}
                  
                  {/* Progress indicator for signatures */}
                  {contract.signatures.length > 0 && (
                    <div className="mb-3">
                      <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-1">
                        <FileSignature className="h-4 w-4" />
                        <span>Signatures: {contract.signatures.filter(s => s.status === 'signed').length} / {contract.signatures.length}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-green-500 h-2 rounded-full transition-all"
                          style={{ 
                            width: `${(contract.signatures.filter(s => s.status === 'signed').length / contract.signatures.length) * 100}%` 
                          }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {/* Tags */}
                  {contract.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3">
                      {contract.tags.slice(0, 3).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                      {contract.tags.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{contract.tags.length - 3}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-2 ml-4">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedContract(contract);
                      setContractForm(contract);
                      setShowContractDialog(true);
                    }}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  
                  {contract.status === 'draft' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSendContract(contract.id)}
                    >
                      <Send className="h-4 w-4" />
                    </Button>
                  )}
                  
                  {contract.documentUrl && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => window.open(contract.documentUrl, '_blank')}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  )}
                  
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleDeleteContract(contract.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  const renderTemplatesGrid = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map(template => {
        const typeConfig = CONTRACT_TYPES.find(t => t.value === template.type);
        const Icon = typeConfig?.icon || FileText;
        
        return (
          <Card key={template.id} className="cursor-pointer hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-blue-50 rounded-lg">
                    <Icon className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{template.name}</h3>
                    <Badge variant="outline">{typeConfig?.label}</Badge>
                  </div>
                </div>
                
                <Badge variant={template.isActive ? "default" : "secondary"}>
                  {template.isActive ? 'Active' : 'Inactive'}
                </Badge>
              </div>
              
              <p className="text-sm text-muted-foreground mb-4 line-clamp-3">
                {template.description}
              </p>
              
              <div className="flex items-center justify-between text-sm text-muted-foreground mb-4">
                <span>{template.variables.length} variables</span>
                <span>Updated {template.updatedAt.toLocaleDateString()}</span>
              </div>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleGenerateFromTemplate(template.id)}
                >
                  Use Template
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setTemplateForm(template);
                    setShowTemplateDialog(true);
                  }}
                >
                  <Edit className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Contract & Legal Document Management</span>
            </CardTitle>
            <div className="flex items-center space-x-2">
              <Dialog open={showTemplateDialog} onOpenChange={setShowTemplateDialog}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Template
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>Create Contract Template</DialogTitle>
                  </DialogHeader>
                  <div className="text-center py-8 text-muted-foreground">
                    Template creation form would be implemented here with rich text editor
                  </div>
                </DialogContent>
              </Dialog>

              <Dialog open={showContractDialog} onOpenChange={setShowContractDialog}>
                <DialogTrigger asChild>
                  <Button size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    New Contract
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-4xl">
                  <DialogHeader>
                    <DialogTitle>
                      {selectedContract ? 'Edit Contract' : 'Create New Contract'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="grid grid-cols-2 gap-4 max-h-96 overflow-y-auto">
                    <div className="col-span-2">
                      <Label htmlFor="contractTitle">Contract Title</Label>
                      <Input
                        id="contractTitle"
                        value={contractForm.title}
                        onChange={(e) => setContractForm(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="Enter contract title"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contractType">Contract Type</Label>
                      <Select 
                        value={contractForm.type} 
                        onValueChange={(value) => setContractForm(prev => ({ ...prev, type: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {CONTRACT_TYPES.map(type => (
                            <SelectItem key={type.value} value={type.value}>
                              {type.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="contractPriority">Priority</Label>
                      <Select 
                        value={contractForm.priority} 
                        onValueChange={(value) => setContractForm(prev => ({ ...prev, priority: value as any }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITY_LEVELS.map(priority => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="clientName">Client Name</Label>
                      <Input
                        id="clientName"
                        value={contractForm.clientName}
                        onChange={(e) => setContractForm(prev => ({ ...prev, clientName: e.target.value }))}
                        placeholder="Enter client name"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="clientEmail">Client Email</Label>
                      <Input
                        id="clientEmail"
                        type="email"
                        value={contractForm.clientEmail}
                        onChange={(e) => setContractForm(prev => ({ ...prev, clientEmail: e.target.value }))}
                        placeholder="Enter client email"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="contractValue">Contract Value</Label>
                      <Input
                        id="contractValue"
                        type="number"
                        value={contractForm.value}
                        onChange={(e) => setContractForm(prev => ({ ...prev, value: Number(e.target.value) }))}
                        placeholder="Enter contract value"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="currency">Currency</Label>
                      <Select 
                        value={contractForm.currency} 
                        onValueChange={(value) => setContractForm(prev => ({ ...prev, currency: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USD">USD</SelectItem>
                          <SelectItem value="EUR">EUR</SelectItem>
                          <SelectItem value="GBP">GBP</SelectItem>
                          <SelectItem value="CAD">CAD</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="col-span-2">
                      <Label htmlFor="description">Description</Label>
                      <Textarea
                        id="description"
                        value={contractForm.description}
                        onChange={(e) => setContractForm(prev => ({ ...prev, description: e.target.value }))}
                        placeholder="Enter contract description"
                        rows={3}
                      />
                    </div>
                    
                    <div className="col-span-2 flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowContractDialog(false)}>
                        Cancel
                      </Button>
                      <Button onClick={selectedContract ? handleUpdateContract : handleCreateContract}>
                        {selectedContract ? 'Update Contract' : 'Create Contract'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Contract Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {contracts.length}
              </div>
              <div className="text-sm text-muted-foreground">Total Contracts</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {contracts.filter(c => c.status === 'pending_signature').length}
              </div>
              <div className="text-sm text-muted-foreground">Pending Signature</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {contracts.filter(c => c.status === 'signed' || c.status === 'completed').length}
              </div>
              <div className="text-sm text-muted-foreground">Signed</div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {contracts.filter(c => {
                  const daysUntilExpiry = getDaysUntilExpiry(c.expiresAt);
                  return daysUntilExpiry !== null && daysUntilExpiry <= 7 && daysUntilExpiry > 0;
                }).length}
              </div>
              <div className="text-sm text-muted-foreground">Expiring Soon</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <div className="flex items-center justify-between mb-6">
              <TabsList>
                <TabsTrigger value="contracts">Contracts</TabsTrigger>
                <TabsTrigger value="templates">Templates</TabsTrigger>
                <TabsTrigger value="settings">Settings</TabsTrigger>
              </TabsList>

              <div className="flex items-center space-x-2">
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
                    placeholder="Search contracts..."
                    value={filters.search}
                    onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                    className="pl-9"
                  />
                </div>
              </div>
              
              <div>
                <Select 
                  value={filters.status} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Statuses</SelectItem>
                    {CONTRACT_STATUSES.map(status => (
                      <SelectItem key={status.value} value={status.value}>
                        {status.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={filters.type} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Types" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    {CONTRACT_TYPES.map(type => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select 
                  value={filters.priority} 
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Priorities" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Priorities</SelectItem>
                    {PRIORITY_LEVELS.map(priority => (
                      <SelectItem key={priority.value} value={priority.value}>
                        {priority.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <TabsContent value="contracts">
              {loading ? (
                <div className="text-center py-8">Loading contracts...</div>
              ) : (
                renderContractsGrid()
              )}
            </TabsContent>

            <TabsContent value="templates">
              {loading ? (
                <div className="text-center py-8">Loading templates...</div>
              ) : (
                renderTemplatesGrid()
              )}
            </TabsContent>

            <TabsContent value="settings">
              <div className="text-center py-8 text-muted-foreground">
                Legal settings and integrations would be configured here
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
