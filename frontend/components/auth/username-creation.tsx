"use client";

import * as React from "react";
import { useState } from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CollabBridgeLogo } from "@/components/ui/collabbridge-logo";
import { useAuth } from "@/hooks/use-auth-firebase";
import { CheckCircle, AlertCircle, Loader2 } from "lucide-react";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

type UserRole = 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL';

interface UsernameCreationProps {
  onUsernameCreated?: (username: string, role: UserRole) => void;
  onSkip?: () => void;
}

export default function UsernameCreation({ onUsernameCreated, onSkip }: UsernameCreationProps) {
  const { user, checkUsernameAvailability, updateProfile } = useAuth();
  const [username, setUsername] = useState("");
  const [role, setRole] = useState<UserRole>('CREATIVE_PROFESSIONAL');
  const [isChecking, setIsChecking] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [availability, setAvailability] = useState<{
    available: boolean;
    message: string;
    checked: boolean;
  }>({ available: false, message: "", checked: false });
  const [error, setError] = useState<string | null>(null);

  const validateUsername = (value: string) => {
    // Username validation rules
    if (value.length < 3) return "Username must be at least 3 characters long";
    if (value.length > 20) return "Username must be less than 20 characters";
    if (!/^[a-zA-Z0-9_]+$/.test(value)) return "Username can only contain letters, numbers, and underscores";
    if (/^[0-9]/.test(value)) return "Username cannot start with a number";
    return null;
  };

  const handleUsernameChange = async (value: string) => {
    setUsername(value);
    setError(null);
    
    // Reset availability state
    setAvailability({ available: false, message: "", checked: false });
    
    // Validate format
    const validationError = validateUsername(value);
    if (validationError) {
      setAvailability({
        available: false,
        message: validationError,
        checked: true
      });
      return;
    }

    // Check availability with debounce
    if (value.length >= 3) {
      setIsChecking(true);
      
      // Simple debounce
      setTimeout(async () => {
        try {
          const isAvailable = await checkUsernameAvailability(value);
          setAvailability({
            available: isAvailable,
            message: isAvailable ? "Username is available!" : "Username is already taken",
            checked: true
          });
        } catch (err) {
          setAvailability({
            available: false,
            message: "Error checking availability",
            checked: true
          });
        } finally {
          setIsChecking(false);
        }
      }, 500);
    }
  };

  const handleCreateUsername = async () => {
    if (!availability.available || !username) return;

    setIsCreating(true);
    setError(null);

    try {
      await updateProfile({ username });
      onUsernameCreated?.(username, role);
    } catch (err: any) {
      setError(err.message || "Failed to create username. Please try again.");
    } finally {
      setIsCreating(false);
    }
  };

  const getStatusIcon = () => {
    if (isChecking) return <Loader2 className="h-4 w-4 animate-spin text-orange-500" />;
    if (!availability.checked) return null;
    if (availability.available) return <CheckCircle className="h-4 w-4 text-green-500" />;
    return <AlertCircle className="h-4 w-4 text-red-500" />;
  };

  const getStatusColor = () => {
    if (isChecking) return "text-orange-600";
    if (!availability.checked) return "text-muted-foreground";
    if (availability.available) return "text-green-600";
    return "text-red-600";
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-md rounded-4xl px-6 py-10 pt-14 shadow-xl border-0">
        <CardContent className="">
          <div className="flex flex-col items-center space-y-8">
            <CollabBridgeLogo variant="wordmark" size="xl" className="text-primary" />

            <div className="space-y-3 text-center">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-orange-500 to-orange-600 bg-clip-text text-transparent">
                Choose Your Username
              </h1>
              <p className="text-muted-foreground text-base leading-relaxed max-w-sm mx-auto">
                Create a unique username to complete your profile. This will be your public identifier on CollabBridge.
              </p>
            </div>

            <div className="w-full space-y-6">
              <div className="space-y-2">
                <Label htmlFor="username" className="text-sm font-semibold text-foreground">
                  Username
                </Label>
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sm font-medium text-orange-500">
                    @
                  </div>
                  <Input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => handleUsernameChange(e.target.value.toLowerCase())}
                    placeholder="your-username"
                    className="w-full rounded-xl pl-8 pr-12 border-2 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200"
                    maxLength={20}
                  />
                  <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    {getStatusIcon()}
                  </div>
                </div>
                
                {availability.checked && (
                  <p className={cn("text-sm font-medium", getStatusColor())}>
                    {availability.message}
                  </p>
                )}
                
                <p className="text-sm text-muted-foreground">
                  Your profile will be available at: <span className="font-mono text-orange-600">collabbridge.vercel.app/@{username || "your-username"}</span>
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-sm font-semibold text-foreground">
                  Your Role
                </Label>
                <Select value={role} onValueChange={(value: string) => setRole(value as UserRole)}>
                  <SelectTrigger className="w-full rounded-xl border-2 focus:border-orange-500 focus:ring-orange-500/20 transition-all duration-200">
                    <SelectValue placeholder="Select your role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EVENT_PLANNER">Event Planner</SelectItem>
                    <SelectItem value="CREATIVE_PROFESSIONAL">Creative Professional</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground">
                  Choose the role that best describes what you do on CollabBridge.
                </p>
              </div>

              {error && (
                <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}

              <div className="space-y-3">
                <Button 
                  onClick={handleCreateUsername}
                  disabled={!availability.available || isCreating || isChecking}
                  className="w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200" 
                  size="lg"
                >
                  {isCreating ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Creating Username...
                    </>
                  ) : (
                    "Create Username & Continue"
                  )}
                </Button>
                
                {onSkip && (
                  <Button
                    variant="ghost"
                    onClick={onSkip}
                    className="w-full text-sm text-muted-foreground hover:text-foreground hover:bg-orange-50 dark:hover:bg-orange-950/20 transition-colors"
                  >
                    Skip for now
                  </Button>
                )}
              </div>

              <div className="space-y-3">
                <h3 className="text-sm font-semibold text-foreground">Username Guidelines:</h3>
                <ul className="text-sm text-muted-foreground space-y-1.5 leading-relaxed">
                  <li className="flex items-start"><span className="text-orange-500 mr-2 font-bold">•</span>3-20 characters long</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2 font-bold">•</span>Letters, numbers, and underscores only</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2 font-bold">•</span>Cannot start with a number</li>
                  <li className="flex items-start"><span className="text-orange-500 mr-2 font-bold">•</span>Must be unique across CollabBridge</li>
                </ul>
              </div>
            </div>

            <p className="text-center text-sm w-11/12 text-muted-foreground leading-relaxed">
              By creating a username, you acknowledge that you read and agree to our{" "}
              <a href="#" className="underline hover:text-orange-500 transition-colors font-medium">
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="#" className="underline hover:text-orange-500 transition-colors font-medium">
                Privacy Policy
              </a>
              .
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
