"use client"

import Image from 'next/image'

import React, { useState } from 'react';
import { Eye, EyeOff, Calendar, Palette } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth-firebase';
import { useRouter } from 'next/navigation';
import { CollabBridgeLogo } from '@/components/ui/collabbridge-logo';

// --- HELPER COMPONENTS (ICONS) ---

const GoogleIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 48 48">
        <path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s12-5.373 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-2.641-.21-5.236-.611-7.743z" />
        <path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 16.318 4 9.656 8.337 6.306 14.691z" />
        <path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238C29.211 35.091 26.715 36 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z" />
        <path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303c-.792 2.237-2.231 4.166-4.087 5.571l6.19 5.238C42.022 35.026 44 30.038 44 24c0-2.641-.21-5.236-.611-7.743z" />
    </svg>
);

// --- TYPE DEFINITIONS ---

export interface Testimonial {
  avatarSrc: string;
  name: string;
  handle: string;
  text: string;
}

type UserRole = 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL' | null;

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
}

// --- SUB-COMPONENTS ---

const GlassInputWrapper = ({ children }: { children: React.ReactNode }) => (
  <div className="rounded-2xl border border-border bg-foreground/5 backdrop-blur-sm transition-colors focus-within:border-violet-400/70 focus-within:bg-violet-500/10">
    {children}
  </div>
);

const RoleCard = ({ 
  role, 
  title, 
  description, 
  icon: Icon, 
  selected, 
  onClick 
}: { 
  role: UserRole; 
  title: string; 
  description: string; 
  icon: React.ComponentType<any>; 
  selected: boolean; 
  onClick: () => void; 
}) => (
  <div 
    className={`cursor-pointer rounded-2xl border-2 p-4 transition-all duration-200 ${
      selected 
        ? 'border-violet-400 bg-violet-50 dark:bg-violet-900/20' 
        : 'border-border bg-card hover:border-violet-200 dark:hover:border-violet-700'
    }`}
    onClick={onClick}
  >
    <div className="flex items-center gap-3">
      <div className={`rounded-xl p-2 ${
        selected 
          ? 'bg-violet-100 text-violet-600 dark:bg-violet-800/50 dark:text-violet-400' 
          : 'bg-muted text-muted-foreground'
      }`}>
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h3 className="font-medium">{title}</h3>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  </div>
);

const TestimonialCard = ({ testimonial, delay }: { testimonial: Testimonial, delay: string }) => (
  <div className={`animate-testimonial ${delay} flex items-start gap-3 rounded-3xl bg-card/40 dark:bg-zinc-800/40 backdrop-blur-xl border border-white/10 p-5 w-64`}>
    <img src={testimonial.avatarSrc} className="h-10 w-10 object-cover rounded-2xl" alt="avatar" />
    <div className="text-sm leading-snug">
      <p className="flex items-center gap-1 font-medium">{testimonial.name}</p>
      <p className="text-muted-foreground">{testimonial.handle}</p>
      <p className="mt-1 text-foreground/80">{testimonial.text}</p>
    </div>
  </div>
);

// --- MAIN COMPONENT ---

export const SignUpPage: React.FC<SignUpPageProps> = ({
  title = <span className="font-light text-foreground tracking-tighter">Join CollabBridge</span>,
  description = "Connect with creative professionals and bring your events to life",
  heroImageSrc,
  testimonials = [],
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { signUp, signInWithGoogle } = useAuth();
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!selectedRole) {
      setError('Please select your role');
      return;
    }

    if (!formData.firstName || !formData.lastName || !formData.email || !formData.password) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setError('');
      setIsLoading(true);
      
      await signUp({
        ...formData,
        role: selectedRole,
      });
      
      // signUp will handle redirect to main dashboard
    } catch (error: any) {
      setError(error.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignUp = async () => {
    try {
      setError('');
      setIsLoading(true);
      await signInWithGoogle();
      router.push('/onboarding');
    } catch (error: any) {
      setError(error.message || 'Google sign up failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[100dvh] flex flex-col md:flex-row font-geist w-[100dvw]">
      {/* Left column: sign-up form */}
      <section className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md">
          <div className="flex flex-col gap-6">
            <div className="animate-element animate-delay-50">
              <CollabBridgeLogo variant="wordmark" size="lg" />
            </div>
            <h1 className="animate-element animate-delay-100 text-4xl md:text-5xl font-semibold leading-tight">{title}</h1>
            <p className="animate-element animate-delay-200 text-muted-foreground">{description}</p>

            <form className="space-y-5" onSubmit={handleSubmit}>
              {error && (
                <div className="animate-element animate-delay-250 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-2xl p-4">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              {/* Role Selection */}
              <div className="animate-element animate-delay-300 space-y-4">
                <label className="text-sm font-medium text-muted-foreground">I am joining as</label>
                <div className="space-y-3">
                  <RoleCard
                    role="EVENT_PLANNER"
                    title="Event Planner"
                    description="I organize events and need creative professionals"
                    icon={Calendar}
                    selected={selectedRole === 'EVENT_PLANNER'}
                    onClick={() => setSelectedRole('EVENT_PLANNER')}
                  />
                  <RoleCard
                    role="CREATIVE_PROFESSIONAL"
                    title="Creative Professional"
                    description="I offer creative services for events"
                    icon={Palette}
                    selected={selectedRole === 'CREATIVE_PROFESSIONAL'}
                    onClick={() => setSelectedRole('CREATIVE_PROFESSIONAL')}
                  />
                </div>
              </div>

              {/* Form Fields */}
              <div className="animate-element animate-delay-400 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <GlassInputWrapper>
                    <input 
                      name="firstName" 
                      type="text" 
                      placeholder="First name" 
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={formData.firstName}
                      onChange={handleInputChange}
                      required
                    />
                  </GlassInputWrapper>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <GlassInputWrapper>
                    <input 
                      name="lastName" 
                      type="text" 
                      placeholder="Last name" 
                      className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                      value={formData.lastName}
                      onChange={handleInputChange}
                      required
                    />
                  </GlassInputWrapper>
                </div>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Username (Optional)</label>
                <GlassInputWrapper>
                  <input 
                    name="username" 
                    type="text" 
                    placeholder="Choose a unique username" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                    value={formData.username}
                    onChange={handleInputChange}
                  />
                </GlassInputWrapper>
                <p className="text-xs text-muted-foreground mt-1">This will be your public profile URL: collabbridge.com/{formData.username || 'username'}</p>
              </div>

              <div className="animate-element animate-delay-600">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <input 
                    name="email" 
                    type="email" 
                    placeholder="Enter your email address" 
                    className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                  />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-700">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input 
                      name="password" 
                      type={showPassword ? "text" : "password"} 
                      placeholder="Create a strong password" 
                      className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none"
                      value={formData.password}
                      onChange={handleInputChange}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-800 space-y-4">
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700 text-white font-medium py-3 px-6 rounded-2xl transition-all duration-200 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
                >
                  {isLoading ? 'Creating Account...' : 'Create Account'}
                </button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t border-border" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <button 
                  type="button" 
                  onClick={handleGoogleSignUp}
                  className="w-full flex items-center justify-center gap-3 border border-border hover:border-violet-200 dark:hover:border-violet-700 bg-background hover:bg-muted/50 py-3 px-6 rounded-2xl transition-all duration-200"
                  disabled={isLoading}
                >
                  <GoogleIcon />
                  <span>Sign up with Google</span>
                </button>
              </div>

              <p className="animate-element animate-delay-900 text-center text-sm text-muted-foreground">
                Already have an account?{' '}
                <button 
                  type="button"
                  onClick={() => router.push('/signin')}
                  className="text-violet-600 hover:text-violet-700 dark:text-violet-400 dark:hover:text-violet-300 font-medium transition-colors"
                >
                  Sign in
                </button>
              </p>
            </form>
          </div>
        </div>
      </section>

      {/* Right column: hero image and testimonials */}
      <section className="flex-1 relative bg-gradient-to-br from-violet-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-8 hidden md:flex items-center justify-center">
        {heroImageSrc && (
          <img
            src={heroImageSrc}
            alt="CollabBridge Hero"
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        
        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div className="absolute inset-0 overflow-hidden">
            <div className="absolute top-20 left-8">
              {testimonials[0] && <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1000" />}
            </div>
            <div className="absolute top-1/2 right-8 -translate-y-1/2">
              {testimonials[1] && <TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1200" />}
            </div>
            <div className="absolute bottom-20 left-1/4">
              {testimonials[2] && <TestimonialCard testimonial={testimonials[2]} delay="animate-delay-1400" />}
            </div>
          </div>
        )}
      </section>
    </div>
  );
};

export default SignUpPage;
