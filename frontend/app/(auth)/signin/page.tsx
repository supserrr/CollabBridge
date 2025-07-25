"use client"

import { SignInPage } from "@/components/auth/sign-in-firebase"

export default function SignInPageRoute() {
  return (
    <SignInPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Welcome to <span className="text-primary font-semibold">CollabBridge</span>
        </span>
      }
      description="Sign in to your account to continue"
      heroImageSrc="/images/auth/signin-hero.jpg"
    />
  )
}
