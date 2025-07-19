import React, { useState } from 'react'
import Link from 'next/link'
import Layout from '@/components/layout/Layout'
import { 
  EnvelopeIcon,
  PhoneIcon,
  ChatBubbleLeftRightIcon,
  QuestionMarkCircleIcon,
  ExclamationCircleIcon,
  CheckCircleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

interface ContactForm {
  name: string
  email: string
  subject: string
  category: string
  message: string
  priority: 'low' | 'medium' | 'high'
}

const SupportPage: React.FC = () => {
  const [formData, setFormData] = useState<ContactForm>({
    name: '',
    email: '',
    subject: '',
    category: 'general',
    message: '',
    priority: 'medium'
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const categories = [
    { value: 'general', label: 'General Question' },
    { value: 'technical', label: 'Technical Issue' },
    { value: 'billing', label: 'Billing & Payments' },
    { value: 'account', label: 'Account & Profile' },
    { value: 'booking', label: 'Booking Issues' },
    { value: 'dispute', label: 'Dispute Resolution' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'bug', label: 'Report a Bug' }
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
    if (error) setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setError('Please fill in all required fields')
      return
    }

    setIsSubmitting(true)
    setError('')

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      setSubmitted(true)
      setFormData({
        name: '',
        email: '',
        subject: '',
        category: 'general',
        message: '',
        priority: 'medium'
      })
    } catch (err) {
      setError('Failed to submit your message. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (submitted) {
    return (
      <Layout>
        <div className="min-h-screen bg-[var(--bg-primary)] flex items-center justify-center">
          <div className="max-w-md mx-auto px-6 text-center">
            <CheckCircleIcon className="w-16 h-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-[var(--text-primary)] mb-4">
              Message Sent!
            </h1>
            <p className="text-[var(--text-secondary)] mb-6">
              Thank you for contacting us. We'll get back to you within 24 hours.
            </p>
            <button
              onClick={() => setSubmitted(false)}
              className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--button-primary)] transition-colors"
            >
              Send Another Message
            </button>
          </div>
        </div>
      </Layout>
    )
  }

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--button-primary)]/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ChatBubbleLeftRightIcon className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Contact Support
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-8">
              Get help from our support team or find answers to common questions
            </p>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <div className="grid lg:grid-cols-3 gap-12">
            {/* Contact Information */}
            <div className="lg:col-span-1">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                Get in Touch
              </h2>
              
              <div className="space-y-6">
                {/* Email Support */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[var(--accent)] rounded-lg flex items-center justify-center">
                      <EnvelopeIcon className="w-6 h-6 text-[var(--bg-primary)]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Email Support</h3>
                    <p className="text-[var(--text-secondary)] mb-2">
                      For general inquiries and support
                    </p>
                    <a 
                      href="mailto:support@collabbridge.com"
                      className="text-[var(--accent)] hover:text-[var(--button-primary)] transition-colors"
                    >
                      support@collabbridge.com
                    </a>
                  </div>
                </div>

                {/* Phone Support */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-[var(--button-primary)] rounded-lg flex items-center justify-center">
                      <PhoneIcon className="w-6 h-6 text-[var(--bg-primary)]" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Phone Support</h3>
                    <p className="text-[var(--text-secondary)] mb-2">
                      Monday - Friday, 9 AM - 6 PM EST
                    </p>
                    <a 
                      href="tel:+18002652227"
                      className="text-[var(--accent)] hover:text-[var(--button-primary)] transition-colors"
                    >
                      1-800-COLLAB-1
                    </a>
                  </div>
                </div>

                {/* Response Times */}
                <div className="flex items-start space-x-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center">
                      <ClockIcon className="w-6 h-6 text-white" />
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[var(--text-primary)]">Response Times</h3>
                    <ul className="text-[var(--text-secondary)] space-y-1">
                      <li>• Critical issues: 2-4 hours</li>
                      <li>• General support: 24 hours</li>
                      <li>• Feature requests: 3-5 days</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="mt-8">
                <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-4">
                  Quick Links
                </h3>
                <div className="space-y-2">
                  <Link
                    href="/help"
                    className="block text-[var(--accent)] hover:text-[var(--button-primary)] transition-colors"
                  >
                    → Help Center & FAQs
                  </Link>
                  <Link
                    href="/terms"
                    className="block text-[var(--accent)] hover:text-[var(--button-primary)] transition-colors"
                  >
                    → Terms of Service
                  </Link>
                  <Link
                    href="/privacy"
                    className="block text-[var(--accent)] hover:text-[var(--button-primary)] transition-colors"
                  >
                    → Privacy Policy
                  </Link>
                </div>
              </div>
            </div>

            {/* Contact Form */}
            <div className="lg:col-span-2">
              <div className="bg-[var(--card-bg)] rounded-2xl border border-[var(--border)] p-8">
                <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-6">
                  Send us a Message
                </h2>

                {error && (
                  <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                    <ExclamationCircleIcon className="w-5 h-5 text-red-500 mr-2" />
                    <p className="text-sm text-red-600">{error}</p>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                  {/* Name and Email */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="name" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Full Name *
                      </label>
                      <input
                        type="text"
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <label htmlFor="email" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Email Address *
                      </label>
                      <input
                        type="email"
                        id="email"
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>

                  {/* Category and Priority */}
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <label htmlFor="category" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Category
                      </label>
                      <select
                        id="category"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      >
                        {categories.map((category) => (
                          <option key={category.value} value={category.value}>
                            {category.label}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label htmlFor="priority" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                        Priority
                      </label>
                      <select
                        id="priority"
                        name="priority"
                        value={formData.priority}
                        onChange={handleInputChange}
                        className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      >
                        <option value="low">Low</option>
                        <option value="medium">Medium</option>
                        <option value="high">High</option>
                      </select>
                    </div>
                  </div>

                  {/* Subject */}
                  <div>
                    <label htmlFor="subject" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Subject *
                    </label>
                    <input
                      type="text"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                      placeholder="Brief description of your issue"
                      required
                    />
                  </div>

                  {/* Message */}
                  <div>
                    <label htmlFor="message" className="block text-sm font-medium text-[var(--text-primary)] mb-2">
                      Message *
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      value={formData.message}
                      onChange={handleInputChange}
                      rows={6}
                      className="w-full px-4 py-3 border border-[var(--border)] rounded-lg bg-[var(--bg-primary)] text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent resize-none"
                      placeholder="Please provide as much detail as possible..."
                      required
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="inline-flex items-center px-8 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--button-primary)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-[var(--bg-primary)] mr-2"></div>
                          Sending...
                        </>
                      ) : (
                        <>
                          <EnvelopeIcon className="w-5 h-5 mr-2" />
                          Send Message
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default SupportPage
