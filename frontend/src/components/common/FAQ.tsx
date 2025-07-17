import React from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

const faqs: FAQItem[] = [
  {
    question: 'What is CollabBridge?',
    answer: 'CollabBridge is a platform that helps teams collaborate more effectively by providing tools for real-time communication, project management, and resource sharing.',
  },
  {
    question: 'How does billing work?',
    answer: 'We offer monthly and annual billing options. You can start with our free plan and upgrade to a paid plan as your needs grow. Annual plans come with a 20% discount.',
  },
  {
    question: 'Can I change plans at any time?',
    answer: 'Yes, you can upgrade, downgrade, or cancel your plan at any time. Changes take effect immediately, and we\'ll prorate any payments.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! We offer a fully-featured 14-day free trial on all paid plans. No credit card required.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit cards (Visa, Mastercard, American Express) and support payment via PayPal for business accounts.',
  },
  {
    question: 'Do you offer refunds?',
    answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied with our service, we\'ll provide a full refund.',
  },
];

export function FAQ() {
  return (
    <div className="space-y-8">
      {faqs.map((faq, index) => (
        <div
          key={index}
          className="card group p-6 transition-all duration-200 hover:shadow-md"
        >
          <h3 className="text-xl font-semibold text-gray-900 group-hover:text-primary">
            {faq.question}
          </h3>
          <p className="mt-3 text-gray-600">{faq.answer}</p>
        </div>
      ))}
    </div>
  );
}

export default FAQ;
