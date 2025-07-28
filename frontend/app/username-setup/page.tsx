"use client";

import UsernameCreation from "@/components/auth/username-creation";
import { useRouter } from "next/navigation";

export default function UsernameCreationPage() {
  const router = useRouter();

  const handleUsernameCreated = (username: string, role: string) => {
    // Redirect to dashboard after username creation
    router.push('/dashboard');
  };

  const handleSkip = () => {
    // Redirect to generic dashboard or onboarding
    router.push('/onboarding');
  };

  return (
    <UsernameCreation 
      onUsernameCreated={handleUsernameCreated}
      onSkip={handleSkip}
    />
  );
}
