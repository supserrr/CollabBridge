import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { validateEmail } from '@/utils/validation';
import toast from 'react-hot-toast';

const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { login, isLoading, error } = useAuthStore();

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // In a real app, you'd integrate with Firebase Auth here
      // For now, we'll simulate with a mock firebaseUid
      await login(email, `firebase_${email.replace('@', '_').replace('.', '_')}`);
      toast.success('Login successful!');
      window.location.href = '/dashboard';
    } catch (error) {
      toast.error('Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Email"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errors.email}
        placeholder="Enter your email"
        required
      />

      {error && (
        <div className="text-sm text-error-600 bg-error-50 p-3 rounded-lg">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={isLoading}
        className="w-full"
      >
        Sign In
      </Button>

      <div className="text-center">
        <a 
          href="/auth/forgot-password" 
          className="text-sm text-brand-600 hover:text-brand-500"
        >
          Forgot your password?
        </a>
      </div>
    </form>
  );
};

export default LoginForm;
