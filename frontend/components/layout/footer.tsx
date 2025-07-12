'use client';

import Link from 'next/link';
import { 
  Mail, 
  Phone, 
  MapPin, 
  Facebook, 
  Twitter, 
  Instagram, 
  Linkedin,
  Github,
  Heart,
  Sparkles,
  ArrowUp,
  Globe,
  Shield,
  Users,
  Calendar
} from 'lucide-react';
import { useState, useEffect } from 'react';

const footerLinks = {
  platform: [
    { name: 'Browse Events', href: '/events' },
    { name: 'Find Professionals', href: '/professionals' },
    { name: 'Create Event', href: '/events/create' },
    { name: 'Join as Professional', href: '/register?role=professional' },
  ],
  company: [
    { name: 'About Us', href: '/about' },
    { name: 'Our Story', href: '/story' },
    { name: 'Careers', href: '/careers' },
    { name: 'Press', href: '/press' },
  ],
  support: [
    { name: 'Help Center', href: '/help' },
    { name: 'Safety Guidelines', href: '/safety' },
    { name: 'Community Guidelines', href: '/community' },
    { name: 'Contact Support', href: '/support' },
  ],
  legal: [
    { name: 'Terms of Service', href: '/terms' },
    { name: 'Privacy Policy', href: '/privacy' },
    { name: 'Cookie Policy', href: '/cookies' },
    { name: 'Refund Policy', href: '/refunds' },
  ]
};

const socialLinks = [
  { name: 'Facebook', href: 'https://facebook.com/collabbridge', icon: Facebook },
  { name: 'Twitter', href: 'https://twitter.com/collabbridge', icon: Twitter },
  { name: 'Instagram', href: 'https://instagram.com/collabbridge', icon: Instagram },
  { name: 'LinkedIn', href: 'https://linkedin.com/company/collabbridge', icon: Linkedin },
  { name: 'Github', href: 'https://github.com/collabbridge', icon: Github },
];

export default function Footer() {
  const [showScrollTop, setShowScrollTop] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.pageYOffset;
      setShowScrollTop(scrollTop > 300);
    };

    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsVisible(entry.isIntersecting);
      },
      { threshold: 0.1 }
    );

    const footerElement = document.getElementById('footer');
    if (footerElement) {
      observer.observe(footerElement);
    }

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
      if (footerElement) {
        observer.unobserve(footerElement);
      }
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <>
      {/* Modern Footer */}
      <footer 
        id="footer"
        className="relative bg-gray-900 text-white overflow-hidden"
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-purple-900/20 to-gray-900"></div>
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZGVmcz48cGF0dGVybiBpZD0iZ3JpZCIgd2lkdGg9IjQwIiBoZWlnaHQ9IjQwIiBwYXR0ZXJuVW5pdHM9InVzZXJTcGFjZU9uVXNlIj48cGF0aCBkPSJNIDQwIDAgTCAwIDAgMCA0MCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJyZ2JhKDI1NSwgMjU1LCAyNTUsIDAuMDUpIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-30"></div>
        
        {/* Floating Orbs */}
        <div className="absolute top-20 right-20 w-32 h-32 rounded-full bg-gradient-to-br from-purple-500/10 to-pink-500/10 blur-2xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 rounded-full bg-gradient-to-br from-blue-500/10 to-cyan-500/10 blur-2xl animate-pulse delay-1000"></div>

        <div className="relative z-10">
          {/* Newsletter Section */}
          <div className="border-b border-gray-800">
            <div className="container mx-auto px-4 py-16 max-w-7xl">
              <div className="max-w-2xl mx-auto text-center">
                <div className={`transform transition-all duration-1000 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <Sparkles className="h-12 w-12 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-2xl lg:text-3xl font-bold mb-4 bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Stay Updated with CollabBridge
                  </h3>
                  <p className="text-gray-400 mb-8 text-lg">
                    Get the latest updates on new features, events, and opportunities in Rwanda's creative scene.
                  </p>
                  
                  <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                    <input
                      type="email"
                      placeholder="Enter your email"
                      className="flex-1 px-4 py-3 rounded-xl bg-gray-800 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                    />
                    <button
                      type="submit"
                      className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 text-white font-semibold rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-purple-500 flex items-center justify-center gap-2"
                    >
                      <Mail className="h-4 w-4" />
                      Subscribe
                    </button>
                  </form>
                </div>
              </div>
            </div>
          </div>

          {/* Main Footer Content */}
          <div className="container mx-auto px-4 py-16 max-w-7xl">
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
              {/* Brand Section */}
              <div className="lg:col-span-2">
                <div className={`transform transition-all duration-1000 delay-200 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <Link href="/" className="inline-block mb-6">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center">
                        <Calendar className="h-6 w-6 text-white" />
                      </div>
                      <span className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                        CollabBridge
                      </span>
                    </div>
                  </Link>
                  
                  <p className="text-gray-400 mb-6 text-lg leading-relaxed">
                    Connecting Rwanda's creative professionals with event planners to create unforgettable experiences. 
                    Building bridges in the creative industry, one event at a time.
                  </p>
                  
                  <div className="flex items-center space-x-2 text-gray-400 mb-4">
                    <MapPin className="h-5 w-5 text-purple-400" />
                    <span>Kigali, Rwanda</span>
                  </div>
                  
                  <div className="flex items-center space-x-2 text-gray-400 mb-6">
                    <Mail className="h-5 w-5 text-purple-400" />
                    <span>hello@collabbridge.rw</span>
                  </div>
                  
                  {/* Social Links */}
                  <div className="flex space-x-4">
                    {socialLinks.map((social, index) => {
                      const Icon = social.icon;
                      return (
                        <a
                          key={social.name}
                          href={social.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="w-12 h-12 rounded-xl bg-gray-800 hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-600 flex items-center justify-center transition-all duration-300 transform hover:scale-110 group"
                          style={{ animationDelay: `${index * 100}ms` }}
                        >
                          <Icon className="h-5 w-5 text-gray-400 group-hover:text-white transition-colors" />
                        </a>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Links Sections */}
              <div className="lg:col-span-3 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {/* Platform Links */}
                <div className={`transform transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <h4 className="text-white font-semibold mb-6 flex items-center">
                    <Globe className="h-5 w-5 text-purple-400 mr-2" />
                    Platform
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.platform.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-purple-400 transition-colors duration-200 block hover:translate-x-1 transform"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Company Links */}
                <div className={`transform transition-all duration-1000 delay-400 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <h4 className="text-white font-semibold mb-6 flex items-center">
                    <Users className="h-5 w-5 text-purple-400 mr-2" />
                    Company
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.company.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-purple-400 transition-colors duration-200 block hover:translate-x-1 transform"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Support Links */}
                <div className={`transform transition-all duration-1000 delay-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <h4 className="text-white font-semibold mb-6 flex items-center">
                    <Shield className="h-5 w-5 text-purple-400 mr-2" />
                    Support
                  </h4>
                  <ul className="space-y-3">
                    {footerLinks.support.map((link) => (
                      <li key={link.name}>
                        <Link
                          href={link.href}
                          className="text-gray-400 hover:text-purple-400 transition-colors duration-200 block hover:translate-x-1 transform"
                        >
                          {link.name}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
              <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
                <div className={`transform transition-all duration-1000 delay-600 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <p className="text-gray-400 flex items-center">
                    <span>© 2025 CollabBridge. Made with</span>
                    <Heart className="h-4 w-4 text-red-500 mx-1 animate-pulse" />
                    <span>in Rwanda</span>
                  </p>
                </div>
                
                <div className={`transform transition-all duration-1000 delay-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-8 opacity-0'}`}>
                  <div className="flex flex-wrap gap-6">
                    {footerLinks.legal.map((link) => (
                      <Link
                        key={link.name}
                        href={link.href}
                        className="text-gray-400 hover:text-purple-400 transition-colors duration-200 text-sm"
                      >
                        {link.name}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Scroll to Top Button */}
      {showScrollTop && (
        <button
          onClick={scrollToTop}
          className="fixed bottom-8 right-8 w-12 h-12 bg-gradient-to-br from-purple-600 to-pink-600 text-white rounded-full shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-500/50 z-50 flex items-center justify-center group"
          aria-label="Scroll to top"
        >
          <ArrowUp className="h-5 w-5 group-hover:scale-110 transition-transform" />
        </button>
      )}
    </>
  );
}