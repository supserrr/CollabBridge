"use client"

import { SignUpPage } from "@/components/auth/sign-up-firebase"

export default function SignUpPageRoute() {
  return (
    <SignUpPage
      title={
        <span className="font-light text-foreground tracking-tighter">
          Join <span className="text-primary font-semibold">CollabBridge</span>
        </span>
      }
      description="Connect with event planners and creative professionals worldwide"
      heroImageSrc="/images/auth/signup-hero.jpg"
    />
  )
}
