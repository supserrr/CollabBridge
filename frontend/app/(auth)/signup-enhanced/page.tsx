"use client"

import { SignUpPage } from "@/components/auth/sign-up-page"
import { useAuth } from "@/hooks/use-auth-firebase"
import { useState } from "react"
import { useRouter } from "next/navigation"

const testimonials = [
  {
    avatarSrc: "/images/testimonials/david-events.jpg",
    name: "David Kim",
    handle: "@davidevents",
    text: "Joined as an event planner and found incredible talent immediately!"
  },
  {
    avatarSrc: "/images/testimonials/lucia-photo.jpg",
    name: "Lucia Martinez", 
    handle: "@luciaphoto",
    text: "As a photographer, CollabBridge opened doors to amazing events!"
  },
  {
    avatarSrc: "/images/testimonials/james-dj.jpg",
    name: "James Wilson",
    handle: "@jamesDJ",
    text: "Best decision ever! Found consistent work through this platform."
  }
]

export default function SignUpPageRoute() {
  const { signUp } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignUp = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const signUpData = {
      firstName: formData.get('firstName') as string,
      lastName: formData.get('lastName') as string,
      email: formData.get('email') as string,
      password: formData.get('password') as string,
      role: formData.get('role') as 'EVENT_PLANNER' | 'CREATIVE_PROFESSIONAL'
    }

    if (!signUpData.role) {
      setError('Please select your role')
      setIsLoading(false)
      return
    }

    try {
      await signUp(signUpData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign up failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google?signup=true`
    } catch (err) {
      setError('Google sign up failed')
    }
  }

  const handleSignIn = () => {
    router.push('/signin')
  }

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      <SignUpPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Join <span className="text-primary font-semibold">CollabBridge</span>
          </span>
        }
        description="Connect with event planners and creative professionals worldwide"
        heroImageSrc="/images/auth/signup-hero.jpg"
        onSignUp={handleSignUp}
        onGoogleSignUp={handleGoogleSignUp}
        onSignIn={handleSignIn}
      />
    </div>
  )
}
