import React from 'react'
import Layout from '@/components/layout/Layout'
import { 
  ShieldCheckIcon,
  EyeIcon,
  LockClosedIcon,
  ShareIcon,
  CogIcon,
  ExclamationTriangleIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline'

const PrivacyPage: React.FC = () => {
  const lastUpdated = "July 19, 2025"

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--button-primary)]/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <ShieldCheckIcon className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Privacy Policy
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-4">
              How we collect, use, and protect your personal information
            </p>
            <p className="text-sm text-[var(--text-secondary)]">
              Last updated: {lastUpdated}
            </p>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-6 py-12">
          <div className="prose prose-lg max-w-none">
            {/* Introduction */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <EyeIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                1. Introduction
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  At CollabBridge, we take your privacy seriously. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our platform, website, and services.
                </p>
                <p>
                  By using CollabBridge, you consent to the data practices described in this policy. If you do not agree with our policies and practices, do not use our services.
                </p>
                <p>
                  This policy applies to all users of CollabBridge, including Event Planners, Creative Professionals, and website visitors.
                </p>
              </div>
            </section>

            {/* Information We Collect */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <LockClosedIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                2. Information We Collect
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Personal Information</h3>
                <p>We collect information you provide directly to us, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Name, email address, and contact information</li>
                  <li>Profile information and professional credentials</li>
                  <li>Portfolio content (photos, videos, documents)</li>
                  <li>Event details and project requirements</li>
                  <li>Payment information and billing details</li>
                  <li>Communication content and messages</li>
                  <li>Reviews, ratings, and feedback</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Automatically Collected Information</h3>
                <p>We automatically collect certain information when you use our platform:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Device information (IP address, browser type, operating system)</li>
                  <li>Usage data (pages visited, time spent, features used)</li>
                  <li>Location information (if you enable location services)</li>
                  <li>Cookies and similar tracking technologies</li>
                  <li>Log files and server data</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Third-Party Information</h3>
                <p>We may receive information from third parties, including:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Social media platforms (when you connect accounts)</li>
                  <li>Payment processors and financial institutions</li>
                  <li>Identity verification services</li>
                  <li>Marketing and analytics partners</li>
                </ul>
              </div>
            </section>

            {/* How We Use Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <CogIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                3. How We Use Your Information
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>We use the information we collect to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide, maintain, and improve our services</li>
                  <li>Process bookings, payments, and transactions</li>
                  <li>Facilitate communication between users</li>
                  <li>Verify identity and prevent fraud</li>
                  <li>Send notifications and important updates</li>
                  <li>Provide customer support and assistance</li>
                  <li>Personalize your experience and recommendations</li>
                  <li>Analyze usage patterns and improve our platform</li>
                  <li>Comply with legal obligations and enforce our terms</li>
                  <li>Send marketing communications (with your consent)</li>
                </ul>
              </div>
            </section>

            {/* Information Sharing */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <ShareIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                4. How We Share Your Information
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>We may share your information in the following circumstances:</p>
                
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">With Other Users</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Profile information visible to potential collaborators</li>
                  <li>Portfolio content for business purposes</li>
                  <li>Contact information when bookings are confirmed</li>
                  <li>Reviews and ratings you provide or receive</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">With Service Providers</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Payment processors for transaction handling</li>
                  <li>Cloud storage providers for data hosting</li>
                  <li>Analytics services for platform improvement</li>
                  <li>Customer support and communication tools</li>
                  <li>Identity verification and background check services</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Legal Requirements</h3>
                <p>We may disclose information when required by law or to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Comply with legal processes or government requests</li>
                  <li>Protect our rights, property, or safety</li>
                  <li>Investigate fraud or security issues</li>
                  <li>Enforce our terms of service</li>
                </ul>
              </div>
            </section>

            {/* Data Security */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                5. Data Security
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.
                </p>
                <p>Security measures include:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Encryption of data in transit and at rest</li>
                  <li>Regular security audits and penetration testing</li>
                  <li>Access controls and authentication requirements</li>
                  <li>Employee training on data protection practices</li>
                  <li>Incident response and breach notification procedures</li>
                </ul>
                <p>
                  However, no method of transmission over the internet or electronic storage is 100% secure. We cannot guarantee absolute security of your information.
                </p>
              </div>
            </section>

            {/* Your Rights and Choices */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                6. Your Rights and Choices
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>You have the following rights regarding your personal information:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Access:</strong> Request access to your personal information</li>
                  <li><strong>Correction:</strong> Update or correct inaccurate information</li>
                  <li><strong>Deletion:</strong> Request deletion of your personal information</li>
                  <li><strong>Portability:</strong> Request a copy of your data in a portable format</li>
                  <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
                  <li><strong>Restriction:</strong> Request restriction of processing</li>
                  <li><strong>Objection:</strong> Object to certain types of processing</li>
                </ul>
                <p>
                  To exercise these rights, contact us using the information provided below. We will respond to your request within 30 days.
                </p>
              </div>
            </section>

            {/* Cookies and Tracking */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                7. Cookies and Tracking Technologies
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  We use cookies, web beacons, and similar technologies to enhance your experience and collect information about how you use our platform.
                </p>
                <p>Types of cookies we use:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li><strong>Essential cookies:</strong> Required for basic platform functionality</li>
                  <li><strong>Performance cookies:</strong> Help us analyze and improve our services</li>
                  <li><strong>Functional cookies:</strong> Remember your preferences and settings</li>
                  <li><strong>Marketing cookies:</strong> Used to deliver relevant advertisements</li>
                </ul>
                <p>
                  You can control cookie settings through your browser preferences. However, disabling certain cookies may affect platform functionality.
                </p>
              </div>
            </section>

            {/* International Transfers */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                8. International Data Transfers
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  CollabBridge operates globally, and your information may be transferred to and processed in countries other than your own. We ensure appropriate safeguards are in place for international transfers, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Adequacy decisions by relevant authorities</li>
                  <li>Standard contractual clauses</li>
                  <li>Binding corporate rules</li>
                  <li>Certification schemes and codes of conduct</li>
                </ul>
              </div>
            </section>

            {/* Children's Privacy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                9. Children's Privacy
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  CollabBridge is not intended for use by children under 18 years of age. We do not knowingly collect personal information from children under 18. If we discover that we have collected information from a child under 18, we will delete it promptly.
                </p>
                <p>
                  If you believe we have collected information from a child under 18, please contact us immediately.
                </p>
              </div>
            </section>

            {/* Changes to Privacy Policy */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                10. Changes to This Privacy Policy
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  We may update this Privacy Policy from time to time to reflect changes in our practices or applicable laws. We will notify you of significant changes via email or platform notifications.
                </p>
                <p>
                  The "Last updated" date at the top of this policy indicates when it was last revised. We encourage you to review this policy periodically.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <EnvelopeIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                11. Contact Us
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  If you have questions about this Privacy Policy or our data practices, please contact us:
                </p>
                <div className="bg-[var(--card-bg)] p-6 rounded-lg border border-[var(--border)]">
                  <ul className="list-none space-y-2">
                    <li><strong>Email:</strong> privacy@collabbridge.com</li>
                    <li><strong>Data Protection Officer:</strong> dpo@collabbridge.com</li>
                    <li><strong>Address:</strong> CollabBridge Privacy Team<br />123 Innovation Drive<br />Tech City, TC 12345</li>
                    <li><strong>Phone:</strong> 1-800-PRIVACY</li>
                  </ul>
                </div>
              </div>
            </section>
          </div>

          {/* Back to Top */}
          <div className="text-center mt-12">
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center px-6 py-3 bg-[var(--accent)] text-[var(--bg-primary)] rounded-lg hover:bg-[var(--button-primary)] transition-colors"
            >
              Back to Top
            </button>
          </div>
        </div>
      </div>
    </Layout>
  )
}

export default PrivacyPage
