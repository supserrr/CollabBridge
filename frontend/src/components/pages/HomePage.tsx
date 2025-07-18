import React, { useState, useEffect } from 'react';
import { 
  MagnifyingGlassIcon,
  UserGroupIcon,
  CalendarDaysIcon,
  StarIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  PlayCircleIcon,
  ChevronRightIcon,
} from '@heroicons/react/24/outline';
import { 
  StarIcon as StarIconSolid,
} from '@heroicons/react/24/solid';
import Navigation from '../layout/Navigation';
import Footer from '../layout/Footer';
import AuthModal from '../auth/AuthModal';
import { Button, Card, CardContent, Avatar, Badge, Loading } from '../ui';
import authService from '../../services/auth';
import type { User } from '../../types';

const HomePage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [authModal, setAuthModal] = useState<'login' | 'register' | 'forgot-password' | 'verify-email' | null>(null);

  useEffect(() => {
    const loadData = async () => {
      try {
        // Check if user is authenticated
        if (authService.isAuthenticated()) {
          const currentUser = await authService.getCurrentUser();
          setUser(currentUser);
        }
      } catch (error) {
        console.error('Error loading data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleAuthSuccess = async () => {
    try {
      const currentUser = await authService.getCurrentUser();
      setUser(currentUser);
    } catch (error) {
      console.error('Error getting current user:', error);
    }
  };

  const features = [
    {
      icon: MagnifyingGlassIcon,
      title: 'Find Perfect Matches',
      description: 'Advanced search and filtering to find exactly the right professionals for your event needs.',
    },
    {
      icon: UserGroupIcon,
      title: 'Verified Professionals',
      description: 'All creative professionals are verified and rated by previous clients for quality assurance.',
    },
    {
      icon: CalendarDaysIcon,
      title: 'Seamless Booking',
      description: 'Easy booking system with built-in contracts, payments, and communication tools.',
    },
    {
      icon: StarIcon,
      title: 'Quality Guarantee',
      description: 'Our review system ensures you get the best service and can make informed decisions.',
    },
  ];

  const howItWorks = [
    {
      step: 1,
      title: 'Create Your Profile',
      description: 'Sign up and create a detailed profile showcasing your skills or event needs.',
      icon: '👤',
    },
    {
      step: 2,
      title: 'Browse & Connect',
      description: 'Search for professionals or events that match your criteria and interests.',
      icon: '🔍',
    },
    {
      step: 3,
      title: 'Collaborate & Create',
      description: 'Work together to bring amazing events to life with seamless tools.',
      icon: '🎉',
    },
  ];

  const testimonials = [
    {
      name: 'Sarah Johnson',
      role: 'Wedding Planner',
      image: '/testimonials/sarah.jpg',
      rating: 5,
      quote: 'CollabBridge helped me find the perfect photographers and florists for my clients. The quality of professionals is outstanding!',
    },
    {
      name: 'Mike Chen',
      role: 'Event Photographer',
      image: '/testimonials/mike.jpg',
      rating: 5,
      quote: 'I\'ve booked over 50 events through CollabBridge. The platform makes it so easy to connect with event planners.',
    },
    {
      name: 'Emma Rodriguez',
      role: 'Corporate Event Manager',
      image: '/testimonials/emma.jpg',
      rating: 5,
      quote: 'The verification system gives me confidence that I\'m working with top-tier professionals every time.',
    },
  ];

  const stats = [
    { number: '10,000+', label: 'Active Professionals' },
    { number: '50,000+', label: 'Successful Events' },
    { number: '4.9/5', label: 'Average Rating' },
    { number: '100+', label: 'Cities Covered' },
  ];

  const featuredProfessionals = [
    {
      id: '1',
      name: 'Alex Rivera',
      title: 'Wedding Photographer',
      location: 'San Francisco, CA',
      rating: 4.9,
      reviews: 127,
      hourlyRate: 150,
      skills: ['Wedding Photography', 'Portrait', 'Event Photography'],
      image: '/professionals/alex.jpg',
    },
    {
      id: '2',
      name: 'Maya Patel',
      title: 'Event Decorator',
      location: 'Los Angeles, CA',
      rating: 4.8,
      reviews: 93,
      hourlyRate: 120,
      skills: ['Floral Design', 'Event Styling', 'Corporate Events'],
      image: '/professionals/maya.jpg',
    },
    {
      id: '3',
      name: 'David Kim',
      title: 'DJ & Sound Engineer',
      location: 'New York, NY',
      rating: 5.0,
      reviews: 156,
      hourlyRate: 200,
      skills: ['DJ Services', 'Sound Engineering', 'Music Production'],
      image: '/professionals/david.jpg',
    },
  ];

  const featuredEvents = [
    {
      id: '1',
      title: 'Corporate Annual Gala',
      eventType: 'Corporate',
      description: 'Seeking experienced event professionals for a high-profile corporate gala event with 500+ attendees.',
      startDate: '2025-09-15',
      budget: 25000,
      requiredRoles: ['Event Coordinator', 'Catering', 'Entertainment'],
      location: 'Downtown Convention Center',
    },
    {
      id: '2',
      title: 'Intimate Garden Wedding',
      eventType: 'Wedding',
      description: 'Looking for creative professionals to help create a magical garden wedding experience.',
      startDate: '2025-08-20',
      budget: 15000,
      requiredRoles: ['Photographer', 'Florist', 'Musicians'],
      location: 'Napa Valley, CA',
    },
    {
      id: '3',
      title: 'Product Launch Party',
      eventType: 'Corporate',
      description: 'Tech startup seeking event professionals for an innovative product launch celebration.',
      startDate: '2025-07-10',
      budget: 18000,
      requiredRoles: ['Stage Design', 'AV Equipment', 'Catering'],
      location: 'San Francisco, CA',
    },
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Navigation user={user} onAuthModal={setAuthModal} />
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loading size="lg" text="Loading..." />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation user={user} onAuthModal={setAuthModal} />
      
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 hero-bg"></div>
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 text-white py-24 lg:py-32">
          <div className="container">
            <div className="max-w-5xl mx-auto text-center">
              <div className="animate-fade-in">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
                  Connect. Collaborate.{' '}
                  <span className="block text-yellow-300">Create Amazing Events</span>
                </h1>
                <p className="text-xl md:text-2xl mb-10 text-gray-100 max-w-3xl mx-auto leading-relaxed">
                  The premier platform connecting event planners with skilled creative professionals. 
                  Find your perfect match and bring extraordinary events to life.
                </p>
                
                <div className="flex flex-col sm:flex-row gap-6 justify-center mb-16">
                  <Button size="lg" className="bg-white text-primary hover:bg-gray-100 hover:scale-105 transition-transform shadow-2xl px-8 py-4 text-lg font-semibold">
                    Browse Professionals
                    <ArrowRightIcon className="ml-2 h-6 w-6" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-2 border-white text-white hover:bg-white hover:text-primary hover:scale-105 transition-all shadow-2xl px-8 py-4 text-lg font-semibold">
                    <PlayCircleIcon className="mr-2 h-6 w-6" />
                    Watch How It Works
                  </Button>
                </div>

                {/* Enhanced Search Bar */}
                <div className="max-w-3xl mx-auto">
                  <div className="glass-effect rounded-2xl p-4 shadow-2xl backdrop-blur-lg">
                    <div className="flex flex-col lg:flex-row gap-3">
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="What type of professional do you need?"
                          className="w-full px-6 py-4 text-gray-900 placeholder-gray-500 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-lg"
                        />
                      </div>
                      <div className="flex-1">
                        <input
                          type="text"
                          placeholder="Location"
                          className="w-full px-6 py-4 text-gray-900 placeholder-gray-500 bg-white rounded-xl border-0 focus:outline-none focus:ring-2 focus:ring-primary shadow-sm text-lg"
                        />
                      </div>
                      <Button className="px-8 py-4 bg-primary hover:bg-primary/90 rounded-xl shadow-lg hover:shadow-xl transition-all">
                        <MagnifyingGlassIcon className="h-6 w-6" />
                        <span className="ml-2 hidden sm:inline">Search</span>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Floating Elements */}
        <div className="absolute top-20 left-10 w-20 h-20 bg-white/10 rounded-full animate-pulse-subtle"></div>
        <div className="absolute bottom-20 right-10 w-32 h-32 bg-white/10 rounded-full animate-pulse-subtle" style={{animationDelay: '1s'}}></div>
        <div className="absolute top-1/2 left-1/4 w-16 h-16 bg-white/10 rounded-full animate-pulse-subtle" style={{animationDelay: '0.5s'}}></div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-gradient-to-r from-gray-50 to-white dark:from-gray-900 dark:to-gray-800">
        <div className="container">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center group">
                <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 shadow-lg hover:shadow-xl transition-all duration-300 hover-lift">
                  <div className="text-4xl md:text-5xl font-bold text-primary mb-3 group-hover:scale-110 transition-transform">
                    {stat.number}
                  </div>
                  <div className="text-muted-foreground font-medium text-lg">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 bg-background">
        <div className="container">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-foreground">How It Works</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
              Getting started on CollabBridge is simple. Follow these three steps to connect with amazing professionals or find your next opportunity.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-12 relative">
            {/* Connection lines for desktop */}
            <div className="hidden md:block absolute top-20 left-1/3 right-1/3 h-px bg-gradient-to-r from-primary/20 via-primary to-primary/20"></div>
            
            {howItWorks.map((step, index) => (
              <div key={index} className="text-center relative group">
                <div className="hover-lift">
                  <div className="relative mb-8">
                    <div className="text-8xl mb-6 group-hover:scale-110 transition-transform">{step.icon}</div>
                    <div className="w-16 h-16 bg-gradient-to-r from-primary to-purple-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-6 shadow-lg group-hover:shadow-xl transition-all">
                      {step.step}
                    </div>
                  </div>
                  <h3 className="text-2xl font-bold mb-4 text-foreground group-hover:text-primary transition-colors">{step.title}</h3>
                  <p className="text-muted-foreground text-lg leading-relaxed">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Professionals */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Professionals</h2>
              <p className="text-muted-foreground">Top-rated creative professionals ready to bring your vision to life</p>
            </div>
            <Button variant="outline">
              View All
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredProfessionals.map((professional) => (
              <Card key={professional.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <Avatar
                      src={professional.image}
                      firstName={professional.name.split(' ')[0]}
                      lastName={professional.name.split(' ')[1]}
                      size="lg"
                    />
                    <div className="flex-1">
                      <h3 className="font-semibold text-lg">
                        {professional.name}
                      </h3>
                      <p className="text-muted-foreground mb-2">{professional.title}</p>
                      <div className="flex items-center mb-3">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <StarIconSolid
                              key={i}
                              className={`h-4 w-4 ${
                                i < Math.floor(professional.rating) ? 'text-yellow-400' : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="ml-2 text-sm text-muted-foreground">
                          {professional.rating} ({professional.reviews} reviews)
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1 mb-3">
                        {professional.skills.slice(0, 3).map((skill) => (
                          <Badge key={skill} variant="secondary" className="text-xs">
                            {skill}
                          </Badge>
                        ))}
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-muted-foreground">
                          From ${professional.hourlyRate}/hr
                        </span>
                        <Button size="sm">View Profile</Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-20">
        <div className="container">
          <div className="flex justify-between items-center mb-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Featured Events</h2>
              <p className="text-muted-foreground">Exciting opportunities for creative professionals</p>
            </div>
            <Button variant="outline">
              View All Events
              <ChevronRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {featuredEvents.map((event) => (
              <Card key={event.id} className="hover-lift">
                <CardContent className="p-6">
                  <div className="mb-4">
                    <Badge variant="outline" className="mb-2">
                      {event.eventType}
                    </Badge>
                    <h3 className="font-semibold text-lg mb-2">{event.title}</h3>
                    <p className="text-muted-foreground text-sm mb-3 line-clamp-2">
                      {event.description}
                    </p>
                  </div>
                  
                  <div className="space-y-2 mb-4">
                    <div className="flex items-center text-sm text-muted-foreground">
                      <CalendarDaysIcon className="h-4 w-4 mr-2" />
                      {new Date(event.startDate).toLocaleDateString()}
                    </div>
                    <div className="flex items-center text-sm text-muted-foreground">
                      <UserGroupIcon className="h-4 w-4 mr-2" />
                      {event.requiredRoles.join(', ')}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-primary">
                      ${event.budget.toLocaleString()}
                    </span>
                    <Button size="sm">Apply Now</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-card">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose CollabBridge?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Our platform is designed to make event collaboration seamless, secure, and successful for everyone involved.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <feature.icon className="h-8 w-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                <p className="text-muted-foreground">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">What Our Community Says</h2>
            <p className="text-xl text-muted-foreground">
              Hear from event planners and professionals who've found success on our platform
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <StarIconSolid key={i} className="h-5 w-5 text-yellow-400" />
                    ))}
                  </div>
                  <blockquote className="text-muted-foreground mb-4">
                    "{testimonial.quote}"
                  </blockquote>
                  <div className="flex items-center">
                    <Avatar
                      src={testimonial.image}
                      firstName={testimonial.name.split(' ')[0]}
                      lastName={testimonial.name.split(' ')[1]}
                      size="sm"
                    />
                    <div className="ml-3">
                      <div className="font-semibold">{testimonial.name}</div>
                      <div className="text-sm text-muted-foreground">{testimonial.role}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 gradient-bg text-white">
        <div className="container text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Create Something Amazing?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join thousands of event planners and creative professionals who are already building successful partnerships on CollabBridge.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-white text-primary hover:bg-gray-100"
              onClick={() => setAuthModal('register')}
            >
              Get Started as Event Planner
            </Button>
            <Button 
              size="lg" 
              variant="outline" 
              className="border-white text-white hover:bg-white hover:text-primary"
              onClick={() => setAuthModal('register')}
            >
              Join as Creative Professional
            </Button>
          </div>
        </div>
      </section>

      <Footer />
      
      {/* Auth Modal */}
      <AuthModal
        isOpen={authModal !== null}
        mode={authModal || 'login'}
        onClose={() => setAuthModal(null)}
        onModeChange={(mode) => setAuthModal(mode)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default HomePage;
