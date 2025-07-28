'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, DollarSign, Calendar, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/hooks/use-auth-firebase';
import { toast } from 'sonner';

interface Payment {
  id: string;
  amount: number;
  currency: string;
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'refunded';
  paymentMethod: string;
  createdAt: string;
  completedAt?: string;
  booking: {
    id: string;
    event: {
      title: string;
      date: string;
    };
    professional?: {
      name: string;
      avatar?: string;
    };
    client?: {
      name: string;
      avatar?: string;
    };
  };
  invoice?: {
    id: string;
    url: string;
  };
}

interface PaymentForm {
  bookingId: string;
  amount: number;
  description: string;
  dueDate: string;
}

interface PaymentManagerProps {
  bookingId?: string;
  userRole?: 'client' | 'professional';
}

export function PaymentManager({ bookingId, userRole = 'client' }: PaymentManagerProps) {
  const { user } = useAuth();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState<PaymentForm>({
    bookingId: bookingId || '',
    amount: 0,
    description: '',
    dueDate: ''
  });

  useEffect(() => {
    loadPayments();
  }, [bookingId]);

  const loadPayments = async () => {
    try {
      const token = localStorage.getItem('auth_token');
      let url = `${process.env.NEXT_PUBLIC_API_URL}/api/payments`;
      
      if (bookingId) {
        url += `?bookingId=${bookingId}`;
      }

      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setPayments(data.payments || []);
      }
    } catch (error) {
      console.error('Error loading payments:', error);
      toast.error('Failed to load payments');
    } finally {
      setIsLoading(false);
    }
  };

  const createPaymentRequest = async () => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('auth_token');

      if (!paymentForm.amount || !paymentForm.description) {
        toast.error('Please fill in all required fields');
        return;
      }

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/request`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(paymentForm),
      });

      if (response.ok) {
        toast.success('Payment request sent successfully!');
        setIsCreateDialogOpen(false);
        setPaymentForm({
          bookingId: bookingId || '',
          amount: 0,
          description: '',
          dueDate: ''
        });
        loadPayments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create payment request');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to create payment request');
    } finally {
      setIsProcessing(false);
    }
  };

  const processPayment = async (paymentId: string) => {
    try {
      setIsProcessing(true);
      const token = localStorage.getItem('auth_token');

      // In a real implementation, this would integrate with Stripe
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${paymentId}/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          paymentMethodId: 'pm_card_visa', // Mock Stripe payment method
        }),
      });

      if (response.ok) {
        toast.success('Payment processed successfully!');
        loadPayments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Payment failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Payment processing failed');
    } finally {
      setIsProcessing(false);
    }
  };

  const requestRefund = async (paymentId: string) => {
    try {
      const token = localStorage.getItem('auth_token');

      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/payments/${paymentId}/refund`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        toast.success('Refund request submitted successfully!');
        loadPayments();
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Refund request failed');
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to request refund');
    }
  };

  const getStatusIcon = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'failed':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      case 'processing':
        return <Clock className="h-4 w-4 text-blue-500" />;
      default:
        return <Clock className="h-4 w-4 text-orange-500" />;
    }
  };

  const getStatusColor = (status: Payment['status']) => {
    switch (status) {
      case 'completed':
        return 'default';
      case 'failed':
        return 'destructive';
      case 'processing':
        return 'secondary';
      default:
        return 'outline';
    }
  };

  const formatCurrency = (amount: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount);
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
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Payment Management
            </CardTitle>
            {userRole === 'professional' && (
              <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Request Payment
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Create Payment Request</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Amount *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={paymentForm.amount}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          amount: parseFloat(e.target.value) || 0 
                        }))}
                        placeholder="0.00"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="description">Description *</Label>
                      <Textarea
                        id="description"
                        value={paymentForm.description}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          description: e.target.value 
                        }))}
                        placeholder="Photography services for wedding event..."
                        rows={3}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Due Date</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={paymentForm.dueDate}
                        onChange={(e) => setPaymentForm(prev => ({ 
                          ...prev, 
                          dueDate: e.target.value 
                        }))}
                      />
                    </div>

                    <div className="flex justify-end gap-2">
                      <Button 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                      <Button 
                        onClick={createPaymentRequest}
                        disabled={isProcessing}
                      >
                        {isProcessing ? 'Creating...' : 'Send Request'}
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
            )}
          </div>
          <CardDescription>
            Manage payments and invoices for your bookings
          </CardDescription>
        </CardHeader>
        <CardContent>
          {payments.length === 0 ? (
            <div className="text-center py-8">
              <CreditCard className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">No payments yet</h3>
              <p className="text-muted-foreground">
                Payment transactions will appear here when available.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {payments.map((payment) => (
                <div key={payment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-2">
                        {getStatusIcon(payment.status)}
                        <Badge variant={getStatusColor(payment.status)}>
                          {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                        </Badge>
                      </div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(payment.amount, payment.currency)}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {payment.status === 'pending' && userRole === 'client' && (
                        <Button 
                          onClick={() => processPayment(payment.id)}
                          disabled={isProcessing}
                          className="flex items-center gap-2"
                        >
                          <CreditCard className="h-4 w-4" />
                          Pay Now
                        </Button>
                      )}
                      {payment.status === 'completed' && (
                        <Button 
                          variant="outline"
                          onClick={() => requestRefund(payment.id)}
                          className="flex items-center gap-2"
                        >
                          Request Refund
                        </Button>
                      )}
                      {payment.invoice && (
                        <Button 
                          variant="outline"
                          onClick={() => window.open(payment.invoice!.url, '_blank')}
                        >
                          View Invoice
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold mb-2">{payment.booking.event.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        {new Date(payment.booking.event.date).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                        <span>Payment Method:</span>
                        <span className="font-medium">{payment.paymentMethod}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {userRole === 'client' && payment.booking.professional && (
                        <>
                          <Avatar>
                            <AvatarImage src={payment.booking.professional.avatar} />
                            <AvatarFallback>
                              {payment.booking.professional.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{payment.booking.professional.name}</p>
                            <p className="text-sm text-muted-foreground">Professional</p>
                          </div>
                        </>
                      )}
                      {userRole === 'professional' && payment.booking.client && (
                        <>
                          <Avatar>
                            <AvatarImage src={payment.booking.client.avatar} />
                            <AvatarFallback>
                              {payment.booking.client.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <p className="font-medium">{payment.booking.client.name}</p>
                            <p className="text-sm text-muted-foreground">Client</p>
                          </div>
                        </>
                      )}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t text-xs text-muted-foreground">
                    <div className="flex justify-between">
                      <span>Created: {new Date(payment.createdAt).toLocaleString()}</span>
                      {payment.completedAt && (
                        <span>Completed: {new Date(payment.completedAt).toLocaleString()}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
