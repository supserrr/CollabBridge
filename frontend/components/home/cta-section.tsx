import Link from 'next/link';
import { ArrowRight, Users, Calendar } from 'lucide-react';

export function CTASection() {
  return (
    <section className="bg-primary-600 section-padding">
      <div className="container-responsive">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
            Ready to Create Something Amazing?
          </h2>
          <p className="mt-6 text-lg text-primary-100">
            Join CollabBridge today and connect with Rwanda's top creative professionals.
            Whether you're planning an event or offering your services, we're here to help.
          </p>

          <div className="mt-10 flex flex-col items-center justify-center gap-6 sm:flex-row">
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg bg-white px-8 py-3 text-base font-medium text-primary-600 shadow-sm transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              <Users className="mr-2 h-5 w-5" />
              Join as Professional
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
            
            <Link
              href="/register"
              className="inline-flex items-center rounded-lg border-2 border-white px-8 py-3 text-base font-medium text-white transition-colors hover:bg-white hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary-600"
            >
              <Calendar className="mr-2 h-5 w-5" />
              Start Planning Events
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </div>

          <div className="mt-8 text-primary-200">
            <p className="text-sm">
              Already have an account?{' '}
              <Link href="/login" className="font-medium text-white hover:text-primary-100">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}