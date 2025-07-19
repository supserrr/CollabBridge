import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useTheme } from '@/components/ThemeProvider';
import { 
  ArrowRightIcon, 
  StarIcon, 
  PlayIcon,
  CheckIcon,
  SparklesIcon,
  UserGroupIcon,
  CameraIcon,
  MicrophoneIcon,
  PaintBrushIcon,
  MusicalNoteIcon,
  GlobeAltIcon,
  ShieldCheckIcon,
  BoltIcon,
  HeartIcon,
  EyeIcon,
  ChevronDownIcon,
  Bars3Icon,
  XMarkIcon,
  SunIcon,
  MoonIcon
} from '@heroicons/react/24/outline';

const ModernCollabBridge = () => {
  const { theme, toggleTheme } = useTheme();
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeService, setActiveService] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({ x: e.clientX, y: e.clientY });
    };

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const services = [
    { name: 'Photography', icon: CameraIcon, color: 'from-purple-500 to-pink-500', count: '2,847' },
    { name: 'Videography', icon: PlayIcon, color: 'from-blue-500 to-cyan-500', count: '1,523' },
    { name: 'Audio & DJ', icon: MusicalNoteIcon, color: 'from-green-500 to-emerald-500', count: '987' },
    { name: 'Design', icon: PaintBrushIcon, color: 'from-orange-500 to-red-500', count: '1,234' },
    { name: 'MC & Speaking', icon: MicrophoneIcon, color: 'from-indigo-500 to-purple-500', count: '765' }
  ];

  const testimonials = [
    {
      name: 'Sarah Chen',
      role: 'Wedding Planner',
      company: 'Elegant Events Studio',
      text: 'CollabBridge transformed how I work. Finding skilled photographers and designers is now effortless.',
      rating: 5,
      image: '👩‍💼'
    },
    {
      name: 'Marcus Rodriguez',
      role: 'Event Photographer',
      company: 'Freelance',
      text: 'I get consistent bookings from vetted planners. My income increased 150% in just 6 months.',
      rating: 5,
      image: '📸'
    },
    {
      name: 'Elena Vasquez',
      role: 'Corporate Event Manager',
      company: 'TechCorp Global',
      text: 'The quality of professionals is outstanding. Every event exceeds expectations.',
      rating: 5,
      image: '🎯'
    }
  ];

  const stats = [
    { label: 'Active Professionals', value: 'Verified', icon: UserGroupIcon },
    { label: 'Global Community', value: 'Worldwide', icon: SparklesIcon },
    { label: 'Success Rate', value: 'Excellent', icon: CheckIcon },
    { label: 'Always Free', value: 'Forever', icon: GlobeAltIcon }
  ];

  return (
    <div className="min-h-screen bg-[var(--bg-primary)] text-[var(--text-primary)] overflow-hidden relative">
      {/* Theme Toggle */}
      <div className="fixed top-4 right-4 z-50">
        <button 
          onClick={toggleTheme}
          className="relative p-3 rounded-full bg-[var(--card-bg)] border border-[var(--border)] shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110 group"
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <div className="relative w-6 h-6">
            <SunIcon 
              className={`absolute inset-0 w-6 h-6 text-[var(--accent)] transition-all duration-300 ${
                theme === 'dark' ? 'opacity-0 rotate-90 scale-75' : 'opacity-100 rotate-0 scale-100 group-hover:rotate-180'
              }`} 
            />
            <MoonIcon 
              className={`absolute inset-0 w-6 h-6 text-[var(--accent)] transition-all duration-300 ${
                theme === 'dark' ? 'opacity-100 rotate-0 scale-100 group-hover:-rotate-12' : 'opacity-0 -rotate-90 scale-75'
              }`} 
            />
          </div>
        </button>
      </div>

      {/* Animated Background */}
      <div className="fixed inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-br from-[var(--accent)]/10 via-[var(--bg-secondary)] to-[var(--accent)]/5" />
        <div 
          className="absolute w-96 h-96 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--button-primary)]/20 rounded-full blur-3xl transition-transform duration-1000 ease-out"
          style={{
            left: mousePosition.x - 192,
            top: mousePosition.y - 192,
            transform: `translate(-50%, -50%) scale(${1 + Math.sin(Date.now() / 3000) * 0.1})`
          }}
        />
        <div className="absolute inset-0 opacity-30">
          {[...Array(50)].map((_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-[var(--accent)] rounded-full animate-pulse"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random() * 2}s`
              }}
            />
          ))}
        </div>
      </div>

      {/* Navigation */}
      <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled ? 'bg-[var(--card-bg)]/80 backdrop-blur-xl border-b border-[var(--border)]' : 'bg-transparent'
      }`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-10 h-10 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-xl flex items-center justify-center">
                <SparklesIcon className="w-6 h-6 text-[var(--bg-primary)]" />
              </div>
              <span className="text-2xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent">
                CollabBridge
              </span>
            </div>

            {/* Desktop Menu */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="#services" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Services</a>
              <a href="#how-it-works" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How It Works</a>
              <a href="#testimonials" className="text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Reviews</a>
              <Link href="/auth/signup" className="bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] px-6 py-2 rounded-full hover:shadow-lg hover:shadow-[var(--accent)]/25 transition-all">
                Get Started
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button 
              className="md:hidden w-10 h-10 flex items-center justify-center"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <XMarkIcon className="w-6 h-6" /> : <Bars3Icon className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-[var(--card-bg)]/95 backdrop-blur-xl border-t border-[var(--border)]">
            <div className="px-6 py-4 space-y-4">
              <a href="#services" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Services</a>
              <a href="#how-it-works" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">How It Works</a>
              <a href="#testimonials" className="block text-[var(--text-secondary)] hover:text-[var(--text-primary)] transition-colors">Reviews</a>
              <Link href="/auth/signup" className="block w-full bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] px-6 py-3 rounded-full text-center">
                Get Started
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center px-6 pt-20">
        <div className="max-w-6xl mx-auto text-center z-10">
          <div className="mb-8">
            <div className="inline-flex items-center px-4 py-2 bg-[var(--card-bg)]/10 backdrop-blur-sm rounded-full text-sm font-medium mb-8 border border-[var(--border)]">
              <BoltIcon className="w-4 h-4 mr-2 text-[var(--accent)]" />
              Revolutionizing Event Collaboration
            </div>
            
            <h1 className="text-6xl md:text-8xl lg:text-9xl font-black mb-8 leading-none">
              <span className="block bg-gradient-to-r from-[var(--text-primary)] via-[var(--text-secondary)] to-[var(--text-primary)] bg-clip-text text-transparent">
                CONNECT
              </span>
              <span className="block bg-gradient-to-r from-[var(--button-primary)] via-[var(--accent)] to-[var(--button-primary)] bg-clip-text text-transparent">
                CREATE
              </span>
              <span className="block bg-gradient-to-r from-[var(--accent)] via-[var(--button-primary)] to-[var(--accent)] bg-clip-text text-transparent">
                CELEBRATE
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[var(--text-secondary)] mb-12 max-w-4xl mx-auto leading-relaxed">
              The future of event planning is here. Connect with world-class creative professionals, 
              collaborate seamlessly, and create unforgettable experiences that leave lasting impressions.
            </p>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/auth/signup" className="group bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-[var(--accent)]/25 transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center">
              <span className="flex items-center justify-center">
                Start Creating Events
                <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
            <Link href="/browse/professionals" className="group bg-[var(--card-bg)]/10 backdrop-blur-sm text-[var(--text-primary)] px-8 py-4 rounded-2xl text-lg font-semibold border border-[var(--border)] hover:bg-[var(--card-bg)]/20 transition-all duration-300 inline-flex items-center justify-center">
              <span className="flex items-center justify-center">
                <PlayIcon className="w-5 h-5 mr-2" />
                Browse Professionals
              </span>
            </Link>
          </div>

          {/* Service Categories Quick Access */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {services.map((service, index) => (
              <div
                key={service.name}
                className={`group p-6 rounded-2xl backdrop-blur-sm border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 cursor-pointer ${
                  activeService === index ? 'bg-[var(--card-bg)]/20' : 'bg-[var(--card-bg)]/5 hover:bg-[var(--card-bg)]/10'
                }`}
                onMouseEnter={() => setActiveService(index)}
              >
                <div className={`w-12 h-12 bg-gradient-to-r ${service.color} rounded-xl flex items-center justify-center mb-4 mx-auto group-hover:scale-110 transition-transform`}>
                  <service.icon className="w-6 h-6 text-white" />
                </div>
                <h3 className="font-semibold text-sm text-center">{service.name}</h3>
                <p className="text-xs text-[var(--text-secondary)] text-center mt-1">{service.count} pros</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <ChevronDownIcon className="w-6 h-6 text-[var(--text-secondary)]" />
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={stat.label} className="text-center group">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-[var(--accent)]/20 to-[var(--button-primary)]/20 rounded-2xl mb-4 group-hover:scale-110 transition-transform">
                  <stat.icon className="w-8 h-8 text-[var(--accent)]" />
                </div>
                <div className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-2">
                  {stat.value}
                </div>
                <div className="text-[var(--text-secondary)] text-sm">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-6">
              How It Works
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              Four simple steps to transform your event planning experience
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[
              {
                step: '01',
                title: 'Create Profile',
                description: 'Build your professional presence with portfolio, skills, and credentials',
                icon: UserGroupIcon,
                color: 'from-blue-500 to-cyan-500'
              },
              {
                step: '02',
                title: 'Smart Matching',
                description: 'Our AI connects you with perfect matches based on style and requirements',
                icon: BoltIcon,
                color: 'from-purple-500 to-pink-500'
              },
              {
                step: '03',
                title: 'Collaborate',
                description: 'Work together seamlessly with built-in tools and communication',
                icon: HeartIcon,
                color: 'from-green-500 to-emerald-500'
              },
              {
                step: '04',
                title: 'Create Magic',
                description: 'Deliver exceptional events and build lasting professional relationships',
                icon: SparklesIcon,
                color: 'from-orange-500 to-red-500'
              }
            ].map((item, index) => (
              <div key={item.step} className="group relative">
                <div className="bg-[var(--card-bg)]/5 backdrop-blur-sm p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 hover:bg-[var(--card-bg)]/10">
                  <div className="flex items-center mb-6">
                    <div className={`w-12 h-12 bg-gradient-to-r ${item.color} rounded-xl flex items-center justify-center mr-4 group-hover:scale-110 transition-transform`}>
                      <item.icon className="w-6 h-6 text-white" />
                    </div>
                    <span className="text-4xl font-bold text-[var(--text-secondary)]">{item.step}</span>
                  </div>
                  <h3 className="text-xl font-bold mb-4">{item.title}</h3>
                  <p className="text-[var(--text-secondary)] leading-relaxed">{item.description}</p>
                </div>
                {index < 3 && (
                  <div className="hidden lg:block absolute top-1/2 -right-4 w-8 h-px bg-gradient-to-r from-[var(--accent)] to-[var(--button-primary)] transform -translate-y-1/2" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id="testimonials" className="py-20 px-6 relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-6">
              Success Stories
            </h2>
            <p className="text-xl text-[var(--text-secondary)] max-w-3xl mx-auto">
              See how CollabBridge is transforming careers and creating extraordinary events
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <div key={index} className="group bg-[var(--card-bg)]/5 backdrop-blur-sm p-8 rounded-3xl border border-[var(--border)] hover:border-[var(--accent)] transition-all duration-300 hover:bg-[var(--card-bg)]/10">
                <div className="flex items-center mb-6">
                  <div className="w-16 h-16 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-2xl flex items-center justify-center text-2xl mr-4 group-hover:scale-110 transition-transform">
                    {testimonial.image}
                  </div>
                  <div>
                    <h4 className="font-bold">{testimonial.name}</h4>
                    <p className="text-[var(--text-secondary)] text-sm">{testimonial.role}</p>
                    <p className="text-[var(--text-secondary)] text-xs">{testimonial.company}</p>
                  </div>
                </div>
                
                <div className="flex mb-4">
                  {[...Array(testimonial.rating)].map((_, i) => (
                    <StarIcon key={i} className="w-5 h-5 text-[var(--accent)] fill-current" />
                  ))}
                </div>
                
                <p className="text-[var(--text-secondary)] leading-relaxed">"{testimonial.text}"</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 relative">
        <div className="max-w-4xl mx-auto text-center">
          <div className="bg-gradient-to-r from-[var(--accent)]/20 to-[var(--button-primary)]/20 backdrop-blur-sm p-12 rounded-3xl border border-[var(--border)]">
            <h2 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-[var(--text-primary)] to-[var(--text-secondary)] bg-clip-text text-transparent mb-6">
              Ready to Transform Your Events?
            </h2>
            <p className="text-xl text-[var(--text-secondary)] mb-8 max-w-2xl mx-auto">
              Join thousands of professionals creating extraordinary experiences together. 
              Start your journey today - completely free.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup?role=planner" className="group bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] text-[var(--bg-primary)] px-8 py-4 rounded-2xl text-lg font-semibold hover:shadow-2xl hover:shadow-[var(--accent)]/25 transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center">
                <span className="flex items-center justify-center">
                  Join as Event Planner
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
              <Link href="/auth/signup?role=professional" className="group bg-[var(--card-bg)] text-[var(--text-primary)] px-8 py-4 rounded-2xl text-lg font-semibold hover:bg-[var(--card-bg)] transform hover:scale-105 transition-all duration-300 inline-flex items-center justify-center">
                <span className="flex items-center justify-center">
                  Join as Creative Pro
                  <ArrowRightIcon className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
              </Link>
            </div>

            <div className="flex items-center justify-center mt-8 space-x-6 text-sm text-[var(--text-secondary)]">
              <div className="flex items-center">
                <CheckIcon className="w-4 h-4 mr-2 text-[var(--success)]" />
                Free to join
              </div>
              <div className="flex items-center">
                <ShieldCheckIcon className="w-4 h-4 mr-2 text-[var(--accent)]" />
                Verified professionals
              </div>
              <div className="flex items-center">
                <BoltIcon className="w-4 h-4 mr-2 text-[var(--accent)]" />
                Instant matching
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-[var(--border)]">
        <div className="max-w-6xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="flex items-center space-x-2 mb-4 md:mb-0">
              <div className="w-8 h-8 bg-gradient-to-r from-[var(--button-primary)] to-[var(--accent)] rounded-lg flex items-center justify-center">
                <SparklesIcon className="w-4 h-4 text-[var(--bg-primary)]" />
              </div>
              <span className="text-xl font-bold">CollabBridge</span>
            </div>
            
            <div className="flex items-center space-x-6 text-sm text-[var(--text-secondary)]">
              <Link href="/privacy" className="hover:text-[var(--text-primary)] transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-[var(--text-primary)] transition-colors">Terms</Link>
              <Link href="/support" className="hover:text-[var(--text-primary)] transition-colors">Support</Link>
              <Link href="/blog" className="hover:text-[var(--text-primary)] transition-colors">Blog</Link>
            </div>
          </div>
          
          <div className="mt-8 pt-8 border-t border-[var(--border)] text-center text-[var(--text-secondary)] text-sm">
            <p>&copy; 2025 CollabBridge. All rights reserved. Made with ❤️ for event creators worldwide.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default ModernCollabBridge;
