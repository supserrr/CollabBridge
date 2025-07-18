import React, { useState } from 'react';
import { XMarkIcon, EyeIcon, EyeSlashIcon } from '@heroicons/react/24/outline';
import { Button, Input, Select, Loading } from '../ui';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import authService from '../../services/auth';
import type { UserRole } from '../../types';
import { UserRole as UserRoleEnum } from '../../types';

// Validation schemas
const loginSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(1, 'Password is required'),
});

const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, 'Password must contain uppercase, lowercase, and number'),
  confirmPassword: z.string(),
  role: z.nativeEnum(UserRoleEnum),
  agreedToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms'),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
});

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

interface AuthModalProps {
  isOpen: boolean;
  mode: 'login' | 'register' | 'forgot-password' | 'verify-email';
  onClose: () => void;
  onModeChange: (mode: 'login' | 'register' | 'forgot-password' | 'verify-email') => void;
  onSuccess?: () => void;
}

const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  mode,
  onClose,
  onModeChange,
  onSuccess,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const forgotPasswordForm = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      await authService.login({
        email: data.email,
        password: data.password,
      });
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Login failed:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await authService.register({
        firstName: data.firstName,
        lastName: data.lastName,
        email: data.email,
        password: data.password,
        confirmPassword: data.confirmPassword,
        role: data.role,
        acceptTerms: data.agreedToTerms,
      });
      // Switch to email verification mode
      onModeChange('verify-email');
    } catch (error) {
      console.error('Registration failed:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    try {
      await authService.forgotPassword(data.email);
      // TODO: Show success message
      alert('Password reset instructions have been sent to your email.');
      onClose();
    } catch (error) {
      console.error('Forgot password failed:', error);
      // TODO: Show error toast
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  const roleOptions = [
    { value: 'EVENT_PLANNER', label: 'Event Planner' },
    { value: 'CREATIVE_PROFESSIONAL', label: 'Creative Professional' },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        {/* Backdrop */}
        <div 
          className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75"
          onClick={onClose}
        />

        {/* Modal */}
        <div className="inline-block align-bottom bg-background rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div className="absolute top-0 right-0 pt-4 pr-4">
            <button
              type="button"
              className="text-muted-foreground hover:text-foreground"
              onClick={onClose}
            >
              <XMarkIcon className="h-6 w-6" />
            </button>
          </div>

          <div className="sm:flex sm:items-start">
            <div className="w-full mt-3 text-center sm:mt-0 sm:text-left">
              {/* Login Form */}
              {mode === 'login' && (
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Welcome Back
                  </h3>
                  <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                    <div>
                      <Input
                        {...loginForm.register('email')}
                        type="email"
                        label="Email Address"
                        placeholder="Enter your email"
                        error={loginForm.formState.errors.email?.message}
                      />
                    </div>
                    
                    <div className="relative">
                      <Input
                        {...loginForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Enter your password"
                        error={loginForm.formState.errors.password?.message}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="flex items-center justify-between">
                      <label className="flex items-center">
                        <input type="checkbox" className="rounded border-border" />
                        <span className="ml-2 text-sm text-muted-foreground">Remember me</span>
                      </label>
                      <button
                        type="button"
                        className="text-sm text-primary hover:underline"
                        onClick={() => onModeChange('forgot-password')}
                      >
                        Forgot password?
                      </button>
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loading size="sm" /> : 'Sign In'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <span className="text-muted-foreground">Don't have an account? </span>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => onModeChange('register')}
                    >
                      Sign up
                    </button>
                  </div>
                </div>
              )}

              {/* Register Form */}
              {mode === 'register' && (
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Create Your Account
                  </h3>
                  <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <Input
                        {...registerForm.register('firstName')}
                        label="First Name"
                        placeholder="Enter your first name"
                        error={registerForm.formState.errors.firstName?.message}
                      />
                      <Input
                        {...registerForm.register('lastName')}
                        label="Last Name"
                        placeholder="Enter your last name"
                        error={registerForm.formState.errors.lastName?.message}
                      />
                    </div>

                    <Input
                      {...registerForm.register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      error={registerForm.formState.errors.email?.message}
                    />

                    <div>
                      <label className="block text-sm font-medium text-foreground mb-2">
                        I am a...
                      </label>
                      <select
                        {...registerForm.register('role')}
                        className="input w-full"
                      >
                        <option value="">Select your role</option>
                        {roleOptions.map((option) => (
                          <option key={option.value} value={option.value}>
                            {option.label}
                          </option>
                        ))}
                      </select>
                      {registerForm.formState.errors.role && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.role.message}
                        </p>
                      )}
                    </div>

                    <div className="relative">
                      <Input
                        {...registerForm.register('password')}
                        type={showPassword ? 'text' : 'password'}
                        label="Password"
                        placeholder="Create a password"
                        error={registerForm.formState.errors.password?.message}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div className="relative">
                      <Input
                        {...registerForm.register('confirmPassword')}
                        type={showConfirmPassword ? 'text' : 'password'}
                        label="Confirm Password"
                        placeholder="Confirm your password"
                        error={registerForm.formState.errors.confirmPassword?.message}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-9 text-muted-foreground hover:text-foreground"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? (
                          <EyeSlashIcon className="h-5 w-5" />
                        ) : (
                          <EyeIcon className="h-5 w-5" />
                        )}
                      </button>
                    </div>

                    <div>
                      <label className="flex items-start">
                        <input
                          type="checkbox"
                          {...registerForm.register('agreedToTerms')}
                          className="rounded border-border mt-0.5"
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          I agree to the{' '}
                          <a href="/terms" className="text-primary hover:underline">
                            Terms of Service
                          </a>{' '}
                          and{' '}
                          <a href="/privacy" className="text-primary hover:underline">
                            Privacy Policy
                          </a>
                        </span>
                      </label>
                      {registerForm.formState.errors.agreedToTerms && (
                        <p className="mt-1 text-sm text-red-600">
                          {registerForm.formState.errors.agreedToTerms.message}
                        </p>
                      )}
                    </div>

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loading size="sm" /> : 'Create Account'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <span className="text-muted-foreground">Already have an account? </span>
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => onModeChange('login')}
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              )}

              {/* Forgot Password Form */}
              {mode === 'forgot-password' && (
                <div>
                  <h3 className="text-2xl font-bold text-foreground mb-6">
                    Reset Your Password
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    Enter your email address and we'll send you instructions to reset your password.
                  </p>
                  <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                    <Input
                      {...forgotPasswordForm.register('email')}
                      type="email"
                      label="Email Address"
                      placeholder="Enter your email"
                      error={forgotPasswordForm.formState.errors.email?.message}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isLoading}
                    >
                      {isLoading ? <Loading size="sm" /> : 'Send Reset Instructions'}
                    </Button>
                  </form>

                  <div className="mt-6 text-center">
                    <button
                      type="button"
                      className="text-primary hover:underline"
                      onClick={() => onModeChange('login')}
                    >
                      Back to sign in
                    </button>
                  </div>
                </div>
              )}

              {/* Email Verification */}
              {mode === 'verify-email' && (
                <div className="text-center">
                  <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                    <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-foreground mb-4">
                    Check Your Email
                  </h3>
                  <p className="text-muted-foreground mb-6">
                    We've sent a verification link to your email address. Please check your email and click the link to verify your account.
                  </p>
                  <Button
                    onClick={onClose}
                    className="w-full"
                  >
                    Got it
                  </Button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthModal;
