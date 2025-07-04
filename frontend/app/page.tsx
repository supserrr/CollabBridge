import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Calendar, Star, CheckCircle, Camera, Music, Palette } from "lucide-react";
import { FeaturesSection } from "@/components/home/features-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";

export default async function HomePage() {
  return (
    <div className="relative">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 via-white to-purple-50 py-20 sm:py-32">
        <div className="container-responsive">
          <div className="mx-auto max-w-4xl text-center">
            {/* Announcement Banner */}
            <div className="mb-8 inline-flex items-center rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-800 ring-1 ring-inset ring-blue-200 animate-fade-in-down">
              <span className="mr-2">🎉</span>
              Connecting Rwanda's Creative Community
            </div>

            {/* Main Heading */}
            <h1 className="mb-6 text-4xl font-bold tracking-tight text-gray-900 sm:text-6xl lg:text-7xl animate-fade-in-up">
              <span className="block">Connect.</span>
              <span className="block gradient-text">Collaborate.</span>
              <span className="block">Create.</span>
            </h1>

            {/* Subheading */}
            <p className="mx-auto mb-10 max-w-2xl text-lg leading-8 text-gray-600 animate-fade-in-up animate-stagger-1">
              The premier platform connecting event planners with verified creative professionals across Rwanda. 
              Find photographers, DJs, decorators, and more for your next unforgettable event.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row animate-fade-in-up animate-stagger-2">
              <Link href="/register" className="btn-primary group px-8 py-3 text-base">
                Get Started Today
                <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link href="/professionals" className="btn-secondary px-8 py-3 text-base">
                Browse Professionals
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-12 flex items-center justify-center gap-8 text-sm text-gray-500 animate-fade-in-up animate-stagger-3">
              <div className="flex items-center">
                <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                Verified Professionals
              </div>
              <div className="flex items-center">
                <Star className="mr-2 h-4 w-4 text-yellow-500" />
                Rated & Reviewed
              </div>
              <div className="flex items-center">
                <Users className="mr-2 h-4 w-4 text-blue-500" />
                Trusted by 100+ Planners
              </div>
            </div>
          </div>
        </div>

        {/* Hero Image/Illustration */}
        <div className="relative mt-16 animate-fade-in-up animate-stagger-4">
          <div className="mx-auto max-w-4xl">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
              {/* Professional Card 1 */}
              <div className="card-interactive">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100">
                    <Camera className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Photography</p>
                    <p className="text-sm text-gray-500">50+ Professionals</p>
                  </div>
                </div>
              </div>

              {/* Professional Card 2 */}
              <div className="card-interactive">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-purple-100">
                    <Music className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">DJ Services</p>
                    <p className="text-sm text-gray-500">30+ Professionals</p>
                  </div>
                </div>
              </div>

              {/* Professional Card 3 */}
              <div className="card-interactive">
                <div className="flex items-center space-x-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-100">
                    <Palette className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Decoration</p>
                    <p className="text-sm text-gray-500">25+ Professionals</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <Suspense fallback={<div className="h-32 bg-gray-50" />}>
        <StatsSection />
      </Suspense>

      {/* Features Section */}
      <Suspense fallback={<div className="h-96 bg-white" />}>
        <FeaturesSection />
      </Suspense>

      {/* How It Works Section */}
      <section className="bg-gray-50 section-padding">
        <div className="container-responsive">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
              How It Works
            </h2>
            <p className="mt-4 text-lg text-gray-600">
              Get connected with top creative professionals in just a few simple steps
            </p>
          </div>

          <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-3">
            {/* Step 1 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-xl font-bold text-primary-600">1</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Create Your Event</h3>
              <p className="mt-2 text-gray-600">
                Post your event details and specify what creative services you need
              </p>
            </div>

            {/* Step 2 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-xl font-bold text-primary-600">2</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Review Applications</h3>
              <p className="mt-2 text-gray-600">
                Receive applications from verified professionals and review their portfolios
              </p>
            </div>

            {/* Step 3 */}
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <span className="text-xl font-bold text-primary-600">3</span>
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">Collaborate & Create</h3>
              <p className="mt-2 text-gray-600">
                Work together to make your event unforgettable and leave reviews
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <Suspense fallback={<div className="h-96 bg-white" />}>
        <TestimonialsSection />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<div className="h-64 bg-primary-600" />}>
        <CTASection />
      </Suspense>
    </div>
  );
}