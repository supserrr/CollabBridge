import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile, signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuthStore } from '@/stores/authStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { USER_ROLE_LABELS, UserRole } from '@/types';
import { validateEmail, validateMinLength } from '@/utils/validation';
import toast from 'react-hot-toast';

const RegisterForm: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const { register, isLoading, error } = useAuthStore();

  const roleOptions = Object.entries(USER_ROLE_LABELS)
    .filter(([key]) => key !== UserRole.ADMIN)
    .map(([value, label]) => ({
      value,
      label,
    }));

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name) {
      newErrors.name = 'Name is required';
    } else if (!validateMinLength(formData.name, 2)) {
      newErrors.name = 'Name must be at least 2 characters';
    }

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.role) {
      newErrors.role = 'Please select your role';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      // Create user with Firebase
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        formData.email,
        formData.password
      );
      
      // Update user profile with name
      await updateProfile(userCredential.user, {
        displayName: formData.name,
      });
      
      // Register with our backend
      await register({
        ...formData,
        firebaseUid: userCredential.user.uid,
      });
      
      toast.success('Registration successful!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Registration error:', error);
      
      let errorMessage = 'Registration failed. Please try again.';
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = 'An account with this email already exists.';
      } else if (error.code === 'auth/weak-password') {
        errorMessage = 'Password is too weak. Please choose a stronger password.';
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = 'Invalid email address.';
      }
      
      toast.error(errorMessage);
    }
  };

  const handleGoogleRegister = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const userCredential = await signInWithPopup(auth, provider);
      const firebaseUser = userCredential.user;
      
      if (!formData.role) {
        toast.error('Please select your role before continuing with Google.');
        return;
      }
      
      // Register with our backend
      await register({
        name: firebaseUser.displayName || firebaseUser.email!.split('@')[0],
        email: firebaseUser.email!,
        role: formData.role,
        firebaseUid: firebaseUser.uid,
      });
      
      toast.success('Google registration successful!');
      window.location.href = '/dashboard';
    } catch (error: any) {
      console.error('Google registration error:', error);
      toast.error('Google registration failed. Please try again.');
    }
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Input
        label="Full Name"
        type="text"
        value={formData.name}
        onChange={(e) => handleChange('name', e.target.value)}
        error={errors.name}
        placeholder="Enter your full name"
        required
      />

      <Input
        label="Email"
        type="email"
        value={formData.email}
        onChange={(e) => handleChange('email', e.target.value)}
        error={errors.email}
        placeholder="Enter your email"
        required
      />

      <Select
        label="I am a..."
        value={formData.role}
        onChange={(e) => handleChange('role', e.target.value)}
        options={roleOptions}
        error={errors.role}
        placeholder="Select your role"
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
        Create Account
      </Button>

      <div className="text-center text-sm text-gray-600">
        By creating an account, you agree to our{' '}
        <a href="/terms" className="text-brand-600 hover:text-brand-500">
          Terms of Service
        </a>{' '}
        and{' '}
        <a href="/privacy" className="text-brand-600 hover:text-brand-500">
          Privacy Policy
        </a>
        .
      </div>
    </form>
  );
};

export default RegisterForm;
