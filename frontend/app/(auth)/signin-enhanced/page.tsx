"use client"

import { SignInPage } from "@/components/auth/sign-in-page"
import { useAuth } from "@/hooks/use-auth-firebase"
import { useState } from "react"
import { useRouter } from "next/navigation"

const testimonials = [
  {
    avatarSrc: "/images/testimonials/sarah-events.jpg",
    name: "Sarah Chen",
    handle: "@sarahevents",
    text: "CollabBridge transformed how I find creative professionals. Amazing platform!"
  },
  {
    avatarSrc: "/images/testimonials/mike-photo.jpg", 
    name: "Mike Rodriguez",
    handle: "@mikephotography",
    text: "Found my dream events through CollabBridge. Highly recommend!"
  },
  {
    avatarSrc: "/images/testimonials/emma-design.jpg",
    name: "Emma Taylor", 
    handle: "@emmadesigns",
    text: "The best platform for creative professionals. Love the community!"
  }
]

export default function SignInPageRoute() {
  const { signIn } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSignIn = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setIsLoading(true)
    setError(null)

    const formData = new FormData(event.currentTarget)
    const email = formData.get('email') as string
    const password = formData.get('password') as string

    try {
      await signIn({ email, password })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Sign in failed')
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    // Implement Google OAuth
    try {
      window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/auth/google`
    } catch (err) {
      setError('Google sign in failed')
    }
  }

  const handleResetPassword = () => {
    router.push('/auth/reset-password')
  }

  const handleCreateAccount = () => {
    router.push('/signup')
  }

  return (
    <div>
      {error && (
        <div className="fixed top-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg z-50">
          {error}
        </div>
      )}
      
      <SignInPage
        title={
          <span className="font-light text-foreground tracking-tighter">
            Welcome back to <span className="text-primary font-semibold">CollabBridge</span>
          </span>
        }
        description="Connect with creative professionals and bring your events to life"
        heroImageSrc="/images/auth/signin-hero.jpg"
        onSignIn={handleSignIn}
        onGoogleSignIn={handleGoogleSignIn}
        onResetPassword={handleResetPassword}
        onCreateAccount={handleCreateAccount}
      />
    </div>
  )
}
