import React from 'react'
import Layout from '@/components/layout/Layout'
import { 
  DocumentTextIcon,
  CalendarDaysIcon,
  ShieldCheckIcon,
  CurrencyDollarIcon,
  ExclamationTriangleIcon,
  UserIcon
} from '@heroicons/react/24/outline'

const TermsPage: React.FC = () => {
  const lastUpdated = "July 19, 2025"

  return (
    <Layout>
      <div className="min-h-screen bg-[var(--bg-primary)]">
        {/* Hero Section */}
        <div className="bg-gradient-to-br from-[var(--accent)]/10 to-[var(--button-primary)]/10 py-16">
          <div className="max-w-4xl mx-auto px-6 text-center">
            <DocumentTextIcon className="w-16 h-16 text-[var(--accent)] mx-auto mb-6" />
            <h1 className="text-4xl md:text-5xl font-bold text-[var(--text-primary)] mb-6">
              Terms of Service
            </h1>
            <p className="text-xl text-[var(--text-secondary)] mb-4">
              Your rights and responsibilities when using CollabBridge
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
                <UserIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                1. Introduction
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  Welcome to CollabBridge ("we," "our," or "us"). These Terms of Service ("Terms") govern your use of the CollabBridge platform, website, and services (collectively, the "Service").
                </p>
                <p>
                  By accessing or using our Service, you agree to be bound by these Terms. If you disagree with any part of these terms, then you may not access the Service.
                </p>
                <p>
                  CollabBridge is a platform that connects event planners with creative professionals including photographers, videographers, designers, musicians, and other creative service providers.
                </p>
              </div>
            </section>

            {/* Account Registration */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <ShieldCheckIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                2. Account Registration and Responsibilities
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  To use certain features of our Service, you must register for an account. You agree to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate, current, and complete information</li>
                  <li>Maintain the security of your password and account</li>
                  <li>Accept responsibility for all activities under your account</li>
                  <li>Notify us immediately of unauthorized access</li>
                  <li>Be at least 18 years old or the age of majority in your jurisdiction</li>
                </ul>
                <p>
                  You may choose to register as either an Event Planner or Creative Professional. Each role has specific features and responsibilities outlined in these Terms.
                </p>
              </div>
            </section>

            {/* Platform Usage */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <CalendarDaysIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                3. Platform Usage Rules
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Event Planners</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Provide accurate event details and requirements</li>
                  <li>Honor booking agreements and payment terms</li>
                  <li>Communicate professionally with creative professionals</li>
                  <li>Provide timely feedback and approvals</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Creative Professionals</h3>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Maintain an accurate and up-to-date portfolio</li>
                  <li>Deliver services as agreed upon</li>
                  <li>Meet deadlines and quality standards</li>
                  <li>Maintain professional conduct and communication</li>
                </ul>

                <h3 className="text-xl font-semibold text-[var(--text-primary)]">Prohibited Activities</h3>
                <p>Users may not:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Use the platform for illegal activities</li>
                  <li>Harass, abuse, or threaten other users</li>
                  <li>Share false, misleading, or inappropriate content</li>
                  <li>Attempt to circumvent platform fees</li>
                  <li>Use automated systems to scrape or abuse the platform</li>
                  <li>Impersonate others or provide false information</li>
                </ul>
              </div>
            </section>

            {/* Payments and Fees */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <CurrencyDollarIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                4. Payments and Fees
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  CollabBridge facilitates payments between Event Planners and Creative Professionals. Our fee structure includes:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>5% service fee on completed bookings</li>
                  <li>Payment processing fees (varies by payment method)</li>
                  <li>Optional premium features and subscriptions</li>
                </ul>
                <p>
                  Payment terms, refund policies, and dispute resolution procedures are outlined in separate documentation provided at booking.
                </p>
                <p>
                  Event Planners are responsible for payment upon booking confirmation. Creative Professionals receive payment upon completion and client approval of deliverables.
                </p>
              </div>
            </section>

            {/* Intellectual Property */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                5. Intellectual Property
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  Users retain ownership of their content, including portfolios, event descriptions, and creative work. By using our platform, you grant CollabBridge a license to display and distribute your content for platform operation and marketing purposes.
                </p>
                <p>
                  Creative work ownership and usage rights are determined by individual agreements between Event Planners and Creative Professionals.
                </p>
                <p>
                  CollabBridge respects intellectual property rights and responds to valid DMCA takedown notices.
                </p>
              </div>
            </section>

            {/* Limitation of Liability */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4 flex items-center">
                <ExclamationTriangleIcon className="w-6 h-6 mr-2 text-[var(--accent)]" />
                6. Limitation of Liability
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  CollabBridge is a platform that connects users but is not directly involved in the provision of creative services. We do not guarantee:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>The quality or timeliness of services provided</li>
                  <li>The accuracy of user profiles or portfolios</li>
                  <li>The completion of bookings or projects</li>
                  <li>Resolution of disputes between users</li>
                </ul>
                <p>
                  Our liability is limited to the amount of fees paid to CollabBridge in the preceding 12 months, up to a maximum of $1,000.
                </p>
              </div>
            </section>

            {/* Termination */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                7. Account Termination
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  You may terminate your account at any time through your account settings. CollabBridge may suspend or terminate accounts for violations of these Terms, including but not limited to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Repeated policy violations</li>
                  <li>Fraudulent activity</li>
                  <li>Harassment of other users</li>
                  <li>Failure to complete bookings or payments</li>
                </ul>
                <p>
                  Upon termination, your access to the platform will be revoked, but certain obligations and liabilities may continue.
                </p>
              </div>
            </section>

            {/* Changes to Terms */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                8. Changes to Terms
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  We may update these Terms from time to time. We will notify users of significant changes via email or platform notifications. Continued use of the Service after changes constitutes acceptance of the new Terms.
                </p>
              </div>
            </section>

            {/* Contact Information */}
            <section className="mb-12">
              <h2 className="text-2xl font-bold text-[var(--text-primary)] mb-4">
                9. Contact Information
              </h2>
              <div className="text-[var(--text-secondary)] space-y-4">
                <p>
                  If you have questions about these Terms, please contact us:
                </p>
                <ul className="list-none space-y-2">
                  <li>Email: legal@collabbridge.com</li>
                  <li>Address: CollabBridge Legal Department</li>
                  <li>Phone: 1-800-COLLAB-1</li>
                </ul>
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

export default TermsPage
