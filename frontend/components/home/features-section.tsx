import { Shield, Search, Star, Users, Calendar, CheckCircle } from 'lucide-react';

export function FeaturesSection() {
  const features = [
    {
      icon: Shield,
      title: 'Verified Professionals',
      description: 'All creative professionals are thoroughly verified and background-checked for your peace of mind.',
    },
    {
      icon: Search,
      title: 'Advanced Search',
      description: 'Find exactly what you need with our powerful search and filtering system.',
    },
    {
      icon: Star,
      title: 'Rated & Reviewed',
      description: 'Make informed decisions with honest reviews from previous clients.',
    },
    {
      icon: Users,
      title: 'Community Driven',
      description: 'Join a thriving community of event planners and creative professionals.',
    },
    {
      icon: Calendar,
      title: 'Easy Scheduling',
      description: 'Streamlined booking process with real-time availability updates.',
    },
    {
      icon: CheckCircle,
      title: 'Quality Guaranteed',
      description: 'We ensure high-quality service delivery for every collaboration.',
    },
  ];

  return (
    <section className="bg-white section-padding">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Why Choose CollabBridge?
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            Everything you need to connect with the best creative professionals in Rwanda
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div key={index} className="card text-center">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-100">
                <feature.icon className="h-6 w-6 text-primary-600" />
              </div>
              <h3 className="mt-6 text-lg font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}