"use client"

import Image from 'next/image'

import React, { useState } from 'react';
import { Eye, EyeOff, Calendar, Palette } from 'lucide-react';
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

type UserRole = 'event_planner' | 'creative_professional' | null;

interface SignUpPageProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  heroImageSrc?: string;
  testimonials?: Testimonial[];
  onSignUp?: (event: React.FormEvent<HTMLFormElement>) => void;
  onGoogleSignUp?: () => void;
  onSignIn?: () => void;
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
  icon: React.ComponentType<{ className?: string }>;
  selected: boolean;
  onClick: () => void;
}) => (
  <div
    onClick={onClick}
    className={`cursor-pointer rounded-2xl border p-6 transition-all hover:border-violet-400/50 hover:bg-violet-500/5 ${
      selected 
        ? 'border-violet-400/70 bg-violet-500/10' 
        : 'border-border bg-foreground/5 backdrop-blur-sm'
    }`}
  >
    <div className="flex items-start gap-4">
      <div className={`rounded-xl p-3 ${selected ? 'bg-violet-500/20' : 'bg-foreground/10'}`}>
        <Icon className={`h-6 w-6 ${selected ? 'text-violet-400' : 'text-muted-foreground'}`} />
      </div>
      <div className="flex-1">
        <h3 className="font-medium text-foreground">{title}</h3>
        <p className="text-sm text-muted-foreground mt-1">{description}</p>
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
  onSignUp,
  onGoogleSignUp,
  onSignIn,
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>(null);

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

            <form className="space-y-5" onSubmit={onSignUp}>
              {/* Role Selection */}
              <div className="animate-element animate-delay-300 space-y-4">
                <label className="text-sm font-medium text-muted-foreground">I am joining as</label>
                <div className="space-y-3">
                  <RoleCard
                    role="event_planner"
                    title="Event Planner"
                    description="I organize events and need creative professionals"
                    icon={Calendar}
                    selected={selectedRole === 'event_planner'}
                    onClick={() => setSelectedRole('event_planner')}
                  />
                  <RoleCard
                    role="creative_professional"
                    title="Creative Professional"
                    description="I offer creative services for events"
                    icon={Palette}
                    selected={selectedRole === 'creative_professional'}
                    onClick={() => setSelectedRole('creative_professional')}
                  />
                </div>
                <input type="hidden" name="role" value={selectedRole || ''} />
              </div>

              {/* Form Fields */}
              <div className="animate-element animate-delay-400 grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">First Name</label>
                  <GlassInputWrapper>
                    <input name="firstName" type="text" placeholder="First name" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                  </GlassInputWrapper>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Last Name</label>
                  <GlassInputWrapper>
                    <input name="lastName" type="text" placeholder="Last name" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                  </GlassInputWrapper>
                </div>
              </div>

              <div className="animate-element animate-delay-500">
                <label className="text-sm font-medium text-muted-foreground">Email Address</label>
                <GlassInputWrapper>
                  <input name="email" type="email" placeholder="Enter your email address" className="w-full bg-transparent text-sm p-4 rounded-2xl focus:outline-none" />
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-600">
                <label className="text-sm font-medium text-muted-foreground">Password</label>
                <GlassInputWrapper>
                  <div className="relative">
                    <input name="password" type={showPassword ? 'text' : 'password'} placeholder="Create a password" className="w-full bg-transparent text-sm p-4 pr-12 rounded-2xl focus:outline-none" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute inset-y-0 right-3 flex items-center">
                      {showPassword ? <EyeOff className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" /> : <Eye className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />}
                    </button>
                  </div>
                </GlassInputWrapper>
              </div>

              <div className="animate-element animate-delay-700 flex items-start gap-3 text-sm">
                <input type="checkbox" name="terms" className="custom-checkbox mt-0.5" required />
                <span className="text-foreground/90">
                  I agree to the <a href="#" className="text-violet-400 hover:underline transition-colors">Terms of Service</a> and <a href="#" className="text-violet-400 hover:underline transition-colors">Privacy Policy</a>
                </span>
              </div>

              <button 
                type="submit" 
                disabled={!selectedRole}
                className="animate-element animate-delay-800 w-full rounded-2xl bg-primary py-4 font-medium text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Account
              </button>
            </form>

            <div className="animate-element animate-delay-900 relative flex items-center justify-center">
              <span className="w-full border-t border-border"></span>
              <span className="px-4 text-sm text-muted-foreground bg-background absolute">Or continue with</span>
            </div>

            <button onClick={onGoogleSignUp} className="animate-element animate-delay-1000 w-full flex items-center justify-center gap-3 border border-border rounded-2xl py-4 hover:bg-secondary transition-colors">
                <GoogleIcon />
                Continue with Google
            </button>

            <p className="animate-element animate-delay-1100 text-center text-sm text-muted-foreground">
              Already have an account? <a href="#" onClick={(e) => { e.preventDefault(); onSignIn?.(); }} className="text-violet-400 hover:underline transition-colors">Sign In</a>
            </p>
          </div>
        </div>
      </section>

      {/* Right column: hero image + testimonials */}
      {heroImageSrc && (
        <section className="hidden md:block flex-1 relative p-4">
          <div className="animate-slide-right animate-delay-300 absolute inset-4 rounded-3xl bg-cover bg-center" style={{ backgroundImage: `url(${heroImageSrc})` }}></div>
          {testimonials.length > 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4 px-8 w-full justify-center">
              <TestimonialCard testimonial={testimonials[0]} delay="animate-delay-1200" />
              {testimonials[1] && <div className="hidden xl:flex"><TestimonialCard testimonial={testimonials[1]} delay="animate-delay-1400" /></div>}
            </div>
          )}
        </section>
      )}
    </div>
  );
};
