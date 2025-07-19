import React, { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { useAuth } from '@/lib/auth/AuthContext'
import { 
  StarIcon,
  BoltIcon,
  EyeIcon,
  TrophyIcon,
  ChartBarIcon,
  CreditCardIcon,
  CheckIcon,
  SparklesIcon,
  RocketLaunchIcon,
  UserIcon
} from '@heroicons/react/24/outline'

interface PricingTier {
  id: string
  name: string
  price: number
  duration: string
  features: string[]
  popular?: boolean
  color: string
  icon: React.ComponentType<any>
}

const PromotePage: React.FC = () => {
  const { user } = useAuth()
  const [selectedTier, setSelectedTier] = useState<string>('')
  const [loading, setLoading] = useState(false)

  const pricingTiers: PricingTier[] = [
    {
      id: 'basic',
      name: 'Basic Boost',
      price: 29,
      duration: '30 days',
      color: 'from-blue-500 to-blue-600',
      icon: BoltIcon,
      features: [
        'Profile highlighted in search results',
        'Priority listing for 30 days',
        '2x more visibility to event planners',
        'Basic analytics dashboard',
        'Email support'
      ]
    },
    {
      id: 'professional',
      name: 'Professional',
      price: 79,
      duration: '90 days',
      color: 'from-purple-500 to-purple-600',
      icon: StarIcon,
      popular: true,
      features: [
        'Everything in Basic Boost',
        'Featured in "Top Professionals" section',
        'Portfolio images get premium placement',
        '5x more visibility to event planners',
        'Advanced analytics and insights',
        'Priority customer support',
        'Badge on profile showing premium status',
        'Early access to new events'
      ]
    },
    {
      id: 'elite',
      name: 'Elite Showcase',
      price: 199,
      duration: '6 months',
      color: 'from-amber-500 to-orange-500',
      icon: TrophyIcon,
      features: [
        'Everything in Professional',
        'Homepage carousel feature spot',
        'Dedicated account manager',
        '10x more visibility to event planners',
        'Custom portfolio themes',
        'Priority event matching',
        'Exclusive networking events access',
        'Featured in newsletter and social media',
        'Direct booking priority',
        'Advanced SEO optimization'
      ]
    }
  ]

  const handleSelectTier = (tierId: string) => {
    setSelectedTier(tierId)
  }

  const handleUpgrade = async (tier: PricingTier) => {
    if (!user) {
      window.location.href = '/auth/signin'
      return
    }

    setLoading(true)
    
    try {
      // Simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Redirect to payment or show success
      alert(`Redirecting to payment for ${tier.name} plan...`)
    } catch (error) {
      alert('Payment failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--button-primary)]/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <RocketLaunchIcon className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Promote Your Profile
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Stand out from the crowd and get more bookings with our promotion packages
            </p>
            {!user && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-8">
                <p className="text-amber-800">
                  <Link href="/auth/signin" className="font-medium underline">Sign in</Link> or{' '}
                  <Link href="/auth/signup" className="font-medium underline">create an account</Link> to promote your profile
                </p>
              </div>
            )}
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-6 py-12">
          {/* Benefits Section */}
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] mb-8">
              Why Promote Your Profile?
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border)]">
                <EyeIcon className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                  Increased Visibility
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Get noticed by more event planners with priority placement in search results and featured sections
                </p>
              </div>
              <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border)]">
                <ChartBarIcon className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                  More Bookings
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Promoted professionals see an average 300% increase in booking inquiries and proposals
                </p>
              </div>
              <div className="bg-[var(--card-bg)] p-8 rounded-2xl border border-[var(--border)]">
                <TrophyIcon className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-[var(--text-primary)] mb-4">
                  Premium Status
                </h3>
                <p className="text-[var(--text-secondary)]">
                  Display premium badges and gain credibility with exclusive features and priority support
                </p>
              </div>
            </div>
          </div>

          {/* Pricing Tiers */}
          <div className="mb-16">
            <h2 className="text-3xl font-bold text-[var(--text-primary)] text-center mb-12">
              Choose Your Promotion Package
            </h2>
            <div className="grid lg:grid-cols-3 gap-8">
              {pricingTiers.map((tier) => (
                <div
                  key={tier.id}
                  className={`relative bg-[var(--card-bg)] rounded-2xl border-2 transition-all duration-300 ${
                    selectedTier === tier.id 
                      ? 'border-[var(--accent)] shadow-lg transform scale-105' 
                      : 'border-[var(--border)] hover:border-[var(--accent)]'
                  } ${tier.popular ? 'ring-2 ring-[var(--accent)] ring-opacity-20' : ''}`}
                  onClick={() => handleSelectTier(tier.id)}
                >
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                      <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--button-primary)] text-[var(--bg-primary)] px-6 py-2 rounded-full text-sm font-semibold">
                        Most Popular
                      </div>
                    </div>
                  )}
                  
                  <div className="p-8">
                    <div className={`w-16 h-16 bg-gradient-to-br ${tier.color} rounded-2xl flex items-center justify-center mb-6`}>
                      <tier.icon className="w-8 h-8 text-white" />
                    </div>
                    
                    <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-2">
                      {tier.name}
                    </h3>
                    
                    <div className="mb-6">
                      <span className="text-4xl font-bold text-[var(--text-primary)]">
                        ${tier.price}
                      </span>
                      <span className="text-[var(--text-secondary)] ml-2">
                        / {tier.duration}
                      </span>
                    </div>
                    
                    <ul className="space-y-4 mb-8">
                      {tier.features.map((feature, index) => (
                        <li key={index} className="flex items-start">
                          <CheckIcon className="w-5 h-5 text-green-500 mr-3 mt-0.5 flex-shrink-0" />
                          <span className="text-[var(--text-secondary)]">{feature}</span>
                        </li>
                      ))}
                    </ul>
                    
                    <button
                      onClick={() => handleUpgrade(tier)}
                      disabled={loading}
                      className={`w-full py-4 px-6 rounded-xl font-semibold transition-all duration-300 ${
                        tier.popular
                          ? 'bg-gradient-to-r from-[var(--accent)] to-[var(--button-primary)] text-[var(--bg-primary)] hover:shadow-lg'
                          : 'bg-[var(--bg-secondary)] text-[var(--text-primary)] border border-[var(--border)] hover:bg-[var(--accent)] hover:text-[var(--bg-primary)]'
                      } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                      {loading ? (
                        <div className="flex items-center justify-center">
                          <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-current mr-2"></div>
                          Processing...
                        </div>
                      ) : (
                        <>
                          {user ? 'Choose Plan' : 'Sign In to Choose'}
                        </>
                      )}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Stats Section */}
          <div className="bg-gradient-to-r from-[var(--accent)]/10 to-[var(--button-primary)]/10 rounded-2xl p-8 mb-16">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
              Success Stories from Promoted Professionals
            </h3>
            <div className="grid md:grid-cols-3 gap-8 text-center">
              <div>
                <div className="text-4xl font-bold text-[var(--accent)] mb-2">300%</div>
                <div className="text-[var(--text-secondary)]">Average increase in profile views</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--accent)] mb-2">5x</div>
                <div className="text-[var(--text-secondary)]">More booking inquiries</div>
              </div>
              <div>
                <div className="text-4xl font-bold text-[var(--accent)] mb-2">85%</div>
                <div className="text-[var(--text-secondary)]">Client retention rate</div>
              </div>
            </div>
          </div>

          {/* FAQ Section */}
          <div className="max-w-3xl mx-auto">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] text-center mb-8">
              Frequently Asked Questions
            </h3>
            <div className="space-y-6">
              {[
                {
                  question: "How quickly will I see results?",
                  answer: "Most professionals see increased visibility within 24 hours and booking inquiries within the first week."
                },
                {
                  question: "Can I cancel my promotion anytime?",
                  answer: "Yes, you can cancel at any time. Your promotion will remain active until the end of your current billing period."
                },
                {
                  question: "What payment methods do you accept?",
                  answer: "We accept all major credit cards, PayPal, and bank transfers for enterprise accounts."
                },
                {
                  question: "Do you offer refunds?",
                  answer: "We offer a 7-day money-back guarantee if you're not satisfied with the increased visibility."
                }
              ].map((faq, index) => (
                <div key={index} className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] p-6">
                  <h4 className="font-semibold text-[var(--text-primary)] mb-2">
                    {faq.question}
                  </h4>
                  <p className="text-[var(--text-secondary)]">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16">
            <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-8">
              <SparklesIcon className="w-12 h-12 text-[var(--accent)] mx-auto mb-4" />
              <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                Ready to Boost Your Business?
              </h3>
              <p className="text-[var(--text-secondary)] mb-6 max-w-2xl mx-auto">
                Join thousands of successful creative professionals who have grown their business with CollabBridge promotion packages.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/contact"
                  className="inline-flex items-center px-6 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
                >
                  <CreditCardIcon className="w-5 h-5 mr-2" />
                  Contact Sales
                </Link>
                <Link
                  href="/help"
                  className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--button-primary)] transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PromotePage
