import { Star } from 'lucide-react';

export function TestimonialsSection() {
  const testimonials = [
    {
      content: "CollabBridge made finding the perfect photographer for our wedding so easy. The platform is user-friendly and all professionals are verified.",
      author: "Sarah Mugisha",
      role: "Event Planner",
      rating: 5,
    },
    {
      content: "As a DJ, CollabBridge has opened up so many opportunities. I've connected with amazing event planners and grown my business significantly.",
      author: "Jean Baptiste",
      role: "DJ & Music Producer",
      rating: 5,
    },
    {
      content: "The quality of professionals on CollabBridge is outstanding. We've used the platform for multiple corporate events with excellent results.",
      author: "Alice Uwimana",
      role: "Corporate Event Manager",
      rating: 5,
    },
  ];

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star
        key={i}
        className={`h-4 w-4 ${
          i < rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
        }`}
      />
    ));
  };

  return (
    <section className="bg-gray-50 section-padding">
      <div className="container-responsive">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
            Trusted by Event Planners Across Rwanda
          </h2>
          <p className="mt-4 text-lg text-gray-600">
            See what our community has to say about their CollabBridge experience
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div key={index} className="card">
              <div className="flex mb-4">
                {renderStars(testimonial.rating)}
              </div>
              <blockquote className="text-gray-700 mb-6">
                "{testimonial.content}"
              </blockquote>
              <div className="flex items-center">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100">
                  <span className="text-sm font-medium text-primary-600">
                    {testimonial.author.split(' ').map(n => n[0]).join('')}
                  </span>
                </div>
                <div className="ml-3">
                  <div className="text-sm font-medium text-gray-900">{testimonial.author}</div>
                  <div className="text-sm text-gray-500">{testimonial.role}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}