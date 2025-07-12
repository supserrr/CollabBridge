export function StatsSection() {
  const stats = [
    {
      number: '100+',
      label: 'Event Planners',
      description: 'Trusted planners',
    },
    {
      number: '200+',
      label: 'Creative Professionals',
      description: 'Verified experts',
    },
    {
      number: '500+',
      label: 'Events Created',
      description: 'Successful collaborations',
    },
    {
      number: '4.8★',
      label: 'Average Rating',
      description: 'Customer satisfaction',
    },
  ];

  return (
    <section className="bg-primary-600 section-padding">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center mb-12">
          <h2 className="text-3xl font-bold text-white">
            Trusted by Rwanda's Creative Community
          </h2>
          <p className="mt-4 text-lg text-primary-100">
            Join thousands of successful collaborations
          </p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-4xl font-bold text-white mb-2">{stat.number}</div>
              <div className="text-lg font-medium text-primary-100">{stat.label}</div>
              <div className="text-sm text-primary-200">{stat.description}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}