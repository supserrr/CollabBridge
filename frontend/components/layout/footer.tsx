import Link from 'next/link';
import { Mail, Phone, MapPin, Github, Twitter, Linkedin } from 'lucide-react';

export default function Footer() {
  const navigation = {
    main: [
      { name: 'Home', href: '/' },
      { name: 'Events', href: '/events' },
      { name: 'Professionals', href: '/professionals' },
      { name: 'How It Works', href: '/how-it-works' },
    ],
    account: [
      { name: 'Sign Up', href: '/register' },
      { name: 'Sign In', href: '/login' },
      { name: 'Dashboard', href: '/dashboard' },
    ],
    support: [
      { name: 'Help Center', href: '/help' },
      { name: 'Contact Us', href: '/contact' },
      { name: 'Privacy Policy', href: '/privacy' },
      { name: 'Terms of Service', href: '/terms' },
    ],
    social: [
      {
        name: 'GitHub',
        href: 'https://github.com/supserrr/CollabBridge',
        icon: Github,
      },
      {
        name: 'Twitter',
        href: '#',
        icon: Twitter,
      },
      {
        name: 'LinkedIn',
        href: '#',
        icon: Linkedin,
      },
    ],
  };

  return (
    <footer className="bg-gray-900" aria-labelledby="footer-heading">
      <h2 id="footer-heading" className="sr-only">
        Footer
      </h2>
      <div className="container-responsive py-12 lg:py-16">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600">
                <span className="text-sm font-bold text-white">CB</span>
              </div>
              <span className="text-xl font-bold text-white">CollabBridge</span>
            </div>
            <p className="mt-4 text-gray-400">
              Connecting event planners with creative professionals across Rwanda.
              Building memorable experiences together.
            </p>
            
            {/* Contact Info */}
            <div className="mt-6 space-y-2">
              <div className="flex items-center text-gray-400">
                <Mail className="h-4 w-4 mr-2" />
                <span className="text-sm">hello@collabbridge.rw</span>
              </div>
              <div className="flex items-center text-gray-400">
                <Phone className="h-4 w-4 mr-2" />
                <span className="text-sm">+250 788 123 456</span>
              </div>
              <div className="flex items-center text-gray-400">
                <MapPin className="h-4 w-4 mr-2" />
                <span className="text-sm">Kigali, Rwanda</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-3 lg:col-span-3">
            {/* Main Navigation */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Platform
              </h3>
              <ul className="mt-4 space-y-4">
                {navigation.main.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Account */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Account
              </h3>
              <ul className="mt-4 space-y-4">
                {navigation.account.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support */}
            <div>
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white">
                Support
              </h3>
              <ul className="mt-4 space-y-4">
                {navigation.support.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-gray-400 hover:text-white transition-colors"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom section */}
        <div className="mt-12 border-t border-gray-800 pt-8">
          <div className="flex flex-col items-center justify-between lg:flex-row">
            <div className="flex space-x-6">
              {navigation.social.map((item) => (
                <a
                  key={item.name}
                  href={item.href}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <span className="sr-only">{item.name}</span>
                  <item.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
            <p className="mt-8 text-gray-400 lg:mt-0">
              &copy; {new Date().getFullYear()} CollabBridge. All rights reserved.
              Built by{' '}
              <span className="text-primary-400 font-medium">Nerd Herd Team</span>.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}