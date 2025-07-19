import React, { useState } from 'react'
import Layout from '@/components/layout/Layout'
import { 
  QuestionMarkCircleIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  ShieldCheckIcon,
  UserGroupIcon,
  EnvelopeIcon,
  ChevronDownIcon,
  ChevronUpIcon
} from '@heroicons/react/24/outline'

interface FAQ {
  id: string
  question: string
  answer: string
  category: 'general' | 'planners' | 'professionals' | 'billing' | 'technical'
}

const HelpPage: React.FC = () => {
  const [activeCategory, setActiveCategory] = useState<string>('all')
  const [expandedFAQ, setExpandedFAQ] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  const faqs: FAQ[] = [
    {
      id: '1',
      category: 'general',
      question: 'What is CollabBridge?',
      answer: 'CollabBridge is a platform that connects event planners with creative professionals like photographers, videographers, designers, and more. We make it easy to find, book, and collaborate with talented professionals for any event.'
    },
    {
      id: '2',
      category: 'general',
      question: 'How do I get started?',
      answer: 'Simply sign up and choose whether you\'re an Event Planner or Creative Professional. Complete your profile, and you can start browsing opportunities or posting events immediately.'
    },
    {
      id: '3',
      category: 'planners',
      question: 'How do I post an event?',
      answer: 'Go to your dashboard and click "Create Event". Fill in the event details, budget, requirements, and publish. Creative professionals can then apply to work on your event.'
    },
    {
      id: '4',
      category: 'planners',
      question: 'How are professionals vetted?',
      answer: 'All professionals go through a verification process including portfolio review, identity verification, and background checks. We also maintain a rating system based on client feedback.'
    },
    {
      id: '5',
      category: 'professionals',
      question: 'How do I apply for events?',
      answer: 'Browse available events that match your skills and interests. Click on an event to view details and submit your application with your proposal and portfolio samples.'
    },
    {
      id: '6',
      category: 'professionals',
      question: 'What percentage does CollabBridge take?',
      answer: 'We charge a small service fee of 5% on completed bookings. This covers payment processing, platform maintenance, and customer support.'
    },
    {
      id: '7',
      category: 'billing',
      question: 'How do payments work?',
      answer: 'Payments are processed securely through our platform. Event planners pay upfront, and professionals receive payment upon completion and client approval of deliverables.'
    },
    {
      id: '8',
      category: 'billing',
      question: 'What if I need to cancel a booking?',
      answer: 'Cancellation policies depend on the timing. Cancellations 48+ hours in advance receive full refunds. Within 48 hours, policies vary by professional and are outlined in booking terms.'
    },
    {
      id: '9',
      category: 'technical',
      question: 'How do I upload my portfolio?',
      answer: 'Go to your profile settings and navigate to the Portfolio section. You can upload images, videos, and documents that showcase your work. We support all major file formats.'
    },
    {
      id: '10',
      category: 'technical',
      question: 'The website isn\'t working properly',
      answer: 'Try refreshing the page or clearing your browser cache. If the problem persists, contact our support team with details about your browser and the issue you\'re experiencing.'
    }
  ]

  const categories = [
    { id: 'all', name: 'All Topics', icon: QuestionMarkCircleIcon },
    { id: 'general', name: 'General', icon: DocumentTextIcon },
    { id: 'planners', name: 'Event Planners', icon: UserGroupIcon },
    { id: 'professionals', name: 'Creative Professionals', icon: ShieldCheckIcon },
    { id: 'billing', name: 'Billing & Payments', icon: EnvelopeIcon },
    { id: 'technical', name: 'Technical Support', icon: ChatBubbleLeftRightIcon }
  ]

  const filteredFAQs = faqs.filter(faq => {
    const matchesCategory = activeCategory === 'all' || faq.category === activeCategory
    const matchesSearch = !searchQuery || 
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesCategory && matchesSearch
  })

  const toggleFAQ = (faqId: string) => {
    setExpandedFAQ(expandedFAQ === faqId ? null : faqId)
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--button-primary)]/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              How can we help you?
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Find answers to common questions or get in touch with our support team
            </p>
            
            {/* Search */}
            <div className="max-w-2xl mx-auto">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search for help articles..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full px-6 py-4 pr-12 rounded-2xl border border-[var(--border)] bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                />
                <QuestionMarkCircleIcon className="absolute right-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-[var(--text-secondary)]" />
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-4 gap-8">
            {/* Categories */}
            <div className="lg:col-span-1">
              <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">Categories</h3>
              <div className="space-y-2">
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => setActiveCategory(category.id)}
                    className={`w-full flex items-center px-4 py-3 rounded-lg text-left transition-colors ${
                      activeCategory === category.id
                        ? 'bg-[var(--accent)] text-[var(--bg-primary)]'
                        : 'bg-[var(--card-bg)] text-[var(--text-primary)] hover:bg-[var(--bg-secondary)]'
                    }`}
                  >
                    <category.icon className="w-5 h-5 mr-3" />
                    {category.name}
                  </button>
                ))}
              </div>
            </div>

            {/* FAQs */}
            <div className="lg:col-span-3">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                Frequently Asked Questions
              </h2>
              
              {filteredFAQs.length === 0 ? (
                <div className="text-center py-12">
                  <QuestionMarkCircleIcon className="w-16 h-16 text-[var(--text-secondary)] mx-auto mb-4" />
                  <p className="text-[var(--text-secondary)]">No matching articles found. Try a different search term or category.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredFAQs.map((faq) => (
                    <div
                      key={faq.id}
                      className="bg-[var(--card-bg)] rounded-lg border border-[var(--border)] overflow-hidden"
                    >
                      <button
                        onClick={() => toggleFAQ(faq.id)}
                        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-[var(--bg-secondary)] transition-colors"
                      >
                        <span className="font-medium text-[var(--text-primary)]">{faq.question}</span>
                        {expandedFAQ === faq.id ? (
                          <ChevronUpIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                        ) : (
                          <ChevronDownIcon className="w-5 h-5 text-[var(--text-secondary)]" />
                        )}
                      </button>
                      {expandedFAQ === faq.id && (
                        <div className="px-6 pb-4">
                          <p className="text-[var(--text-secondary)] leading-relaxed">{faq.answer}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Contact Support */}
          <div className="mt-16 bg-gradient-to-r from-[var(--accent)]/10 to-[var(--button-primary)]/10 rounded-2xl p-8 text-center">
            <h3 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
              Still need help?
            </h3>
            <p className="text-[var(--text-secondary)] mb-6">
              Can't find what you're looking for? Our support team is here to help.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="mailto:support@collabbridge.com"
                className="inline-flex items-center px-6 py-3 bg-[var(--button-primary)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--accent)] transition-colors"
              >
                <EnvelopeIcon className="w-5 h-5 mr-2" />
                Email Support
              </a>
              <a
                href="/contact"
                className="inline-flex items-center px-6 py-3 bg-[var(--card-bg)] text-[var(--text-primary)] border border-[var(--border)] rounded-lg hover:bg-[var(--bg-secondary)] transition-colors"
              >
                <ChatBubbleLeftRightIcon className="w-5 h-5 mr-2" />
                Contact Form
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default HelpPage
