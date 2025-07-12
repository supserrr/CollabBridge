import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight, Users, Calendar, Star, CheckCircle, Camera, Music, Palette, Sparkles, Zap, Globe } from "lucide-react";
import { FeaturesSection } from "@/components/home/features-section";
import { StatsSection } from "@/components/home/stats-section";
import { TestimonialsSection } from "@/components/home/testimonials-section";
import { CTASection } from "@/components/home/cta-section";

export default async function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section - More Modern Design */}
      <section className="relative min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Animated Background Elements */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-32 w-96 h-96 rounded-full bg-gradient-to-br from-purple-400/20 to-pink-400/20 blur-3xl animate-pulse"></div>
          <div className="absolute -bottom-40 -left-32 w-96 h-96 rounded-full bg-gradient-to-br from-blue-400/20 to-cyan-400/20 blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full bg-gradient-to-br from-orange-400/10 to-pink-400/10 blur-3xl animate-pulse delay-500"></div>
        </div>

        {/* Grid Pattern Overlay */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDMpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>

        <div className="container-responsive relative z-10">
          <div className="mx-auto max-w-5xl text-center">
            {/* Floating Badge */}
            <div className="mb-8 inline-flex items-center rounded-full bg-white/10 backdrop-blur-md px-6 py-3 text-sm font-medium text-white ring-1 ring-white/20 hover:bg-white/20 transition-all duration-300 group">
              <Sparkles className="mr-2 h-4 w-4 text-purple-300 group-hover:rotate-12 transition-transform" />
              <span className="bg-gradient-to-r from-purple-300 to-pink-300 bg-clip-text text-transparent font-semibold">
                Connecting Rwanda's Creative Community
              </span>
            </div>

            {/* Main Heading - Enhanced Typography */}
            <h1 className="mb-8 text-5xl font-bold tracking-tight text-white sm:text-7xl lg:text-8xl">
              <span className="block animate-fade-in-up">Create.</span>
              <span className="block bg-gradient-to-r from-purple-400 via-pink-400 to-orange-400 bg-clip-text text-transparent animate-fade-in-up animate-stagger-1">
                Collaborate.
              </span>
              <span className="block animate-fade-in-up animate-stagger-2">Connect.</span>
            </h1>

            {/* Enhanced Subheading */}
            <p className="mx-auto mb-12 max-w-3xl text-xl leading-relaxed text-gray-300 animate-fade-in-up animate-stagger-3">
              The premier platform where <span className="text-purple-300 font-semibold">event planners</span> discover and connect with 
              <span className="text-pink-300 font-semibold"> verified creative professionals</span> across Rwanda. 
              From photographers to DJs, decorators to performers – your next unforgettable event starts here.
            </p>

            {/* Enhanced CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center animate-fade-in-up animate-stagger-4">
              <Link href="/register" className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200 animate-tilt"></div>
                <button className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl leading-none flex items-center text-white font-semibold text-lg hover:scale-105 transition-transform duration-200">
                  <span>Get Started Free</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <Link href="/events" className="group px-8 py-4 bg-white/10 backdrop-blur-md rounded-xl border border-white/20 text-white font-semibold text-lg hover:bg-white/20 transition-all duration-200 flex items-center hover:scale-105">
                <span>Explore Events</span>
                <Globe className="ml-2 h-5 w-5 group-hover:rotate-12 transition-transform" />
              </Link>
            </div>

            {/* Trust Indicators */}
            <div className="mt-16 animate-fade-in-up animate-stagger-4">
              <p className="text-gray-400 text-sm mb-6">Trusted by creative professionals across Rwanda</p>
              <div className="flex justify-center items-center space-x-8 opacity-60">
                <div className="flex items-center space-x-2">
                  <Camera className="h-6 w-6 text-purple-400" />
                  <span className="text-white font-medium">Photographers</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Music className="h-6 w-6 text-pink-400" />
                  <span className="text-white font-medium">Musicians</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Palette className="h-6 w-6 text-orange-400" />
                  <span className="text-white font-medium">Decorators</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center">
            <div className="w-1 h-3 bg-white/50 rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Enhanced Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Everything you need to create 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> exceptional events</span>
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Our platform brings together the best creative professionals in Rwanda with seamless tools for collaboration and project management.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="h-8 w-8" />,
                title: "Verified Professionals",
                description: "Connect with background-checked creative professionals with proven track records",
                color: "from-blue-500 to-cyan-500"
              },
              {
                icon: <Calendar className="h-8 w-8" />,
                title: "Smart Matching",
                description: "AI-powered recommendations to find the perfect professionals for your event needs",
                color: "from-purple-500 to-pink-500"
              },
              {
                icon: <Star className="h-8 w-8" />,
                title: "Quality Assurance",
                description: "Real reviews and ratings from previous clients ensure quality service delivery",
                color: "from-orange-500 to-red-500"
              },
              {
                icon: <CheckCircle className="h-8 w-8" />,
                title: "Secure Payments",
                description: "Safe and secure payment processing with escrow protection for all parties",
                color: "from-green-500 to-emerald-500"
              },
              {
                icon: <Zap className="h-8 w-8" />,
                title: "Instant Communication",
                description: "Real-time messaging and collaboration tools to keep your projects on track",
                color: "from-yellow-500 to-orange-500"
              },
              {
                icon: <Globe className="h-8 w-8" />,
                title: "Nationwide Network",
                description: "Access to creative professionals across all provinces of Rwanda",
                color: "from-indigo-500 to-purple-500"
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r opacity-0 group-hover:opacity-100 transition duration-500 blur rounded-2xl" style={{backgroundImage: `linear-gradient(to right, ${feature.color.split(' ')[1]}, ${feature.color.split(' ')[3]})`}}></div>
                <div className="relative bg-white p-8 rounded-2xl shadow-sm border border-gray-200 hover:shadow-xl transition-all duration-500 hover:-translate-y-2">
                  <div className={`inline-flex p-3 rounded-xl bg-gradient-to-r ${feature.color} text-white mb-4`}>
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">{feature.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced Stats Section */}
      <section className="py-24 bg-gradient-to-r from-purple-900 via-blue-900 to-indigo-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjYwIiBoZWlnaHQ9IjYwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDYwIDAgTCAwIDAgMCA2MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container-responsive relative z-10">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">Making an impact across Rwanda</h2>
            <p className="text-xl text-gray-300">Join thousands of successful collaborations</p>
          </div>
          
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              { number: "1000+", label: "Active Professionals", icon: <Users className="h-6 w-6" /> },
              { number: "500+", label: "Events Created", icon: <Calendar className="h-6 w-6" /> },
              { number: "98%", label: "Success Rate", icon: <Star className="h-6 w-6" /> },
              { number: "30", label: "Districts Covered", icon: <Globe className="h-6 w-6" /> }
            ].map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 hover:bg-white/20 transition-all duration-300 hover:scale-105">
                  <div className="flex justify-center mb-4 text-purple-300 group-hover:scale-110 transition-transform">
                    {stat.icon}
                  </div>
                  <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
                  <div className="text-gray-300 font-medium">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Enhanced CTA Section */}
      <section className="py-24 bg-gray-50">
        <div className="container-responsive">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-4xl font-bold text-gray-900 mb-6">
              Ready to create something 
              <span className="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"> extraordinary?</span>
            </h2>
            <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto">
              Join CollabBridge today and connect with Rwanda's most talented creative professionals. 
              Your next successful event is just a click away.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link href="/register" className="group relative">
                <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl blur opacity-75 group-hover:opacity-100 transition duration-1000 group-hover:duration-200"></div>
                <button className="relative px-8 py-4 bg-gradient-to-r from-purple-600 to-pink-600 rounded-xl text-white font-semibold text-lg hover:scale-105 transition-transform duration-200 flex items-center">
                  <span>Start Creating Now</span>
                  <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                </button>
              </Link>
              
              <Link href="/professionals" className="px-8 py-4 bg-white border-2 border-gray-300 rounded-xl text-gray-800 font-semibold text-lg hover:border-purple-500 hover:text-purple-600 transition-all duration-200 flex items-center hover:scale-105">
                <span>Browse Professionals</span>
                <Users className="ml-2 h-5 w-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={<div>Loading...</div>}>
        <TestimonialsSection />
      </Suspense>
    </div>
  );
}