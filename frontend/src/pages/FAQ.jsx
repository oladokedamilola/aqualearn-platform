import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: 'What is AquaLearn?',
      answer: 'AquaLearn is an online learning platform designed specifically for Nigerian fish farmers. We provide practical aquaculture education through video tutorials, interactive quizzes, and verifiable certifications.'
    },
    {
      question: 'Who is AquaLearn for?',
      answer: 'AquaLearn is for aspiring and existing small-scale fish farmers in Nigeria. Whether you\'re just starting out or looking to improve your existing practices, our courses are designed to meet you where you are.'
    },
    {
      question: 'Is AquaLearn free?',
      answer: 'Yes! All our courses are completely free to access. We believe that quality education should be accessible to everyone, regardless of their financial situation.'
    },
    {
      question: 'What courses are available?',
      answer: 'We currently offer courses on Introduction to Fish Farming, Catfish Farming Essentials, and Pond Management & Water Quality. More courses are being developed regularly.'
    },
    {
      question: 'Do I need internet to access the courses?',
      answer: 'Yes, you need internet access to watch videos and take quizzes. However, our platform is optimized for mobile devices and works well on slower connections.'
    },
    {
      question: 'Will I receive a certificate?',
      answer: 'Yes! Upon completing a course (all lessons and quizzes), you\'ll earn a verifiable certificate that you can download, print, and share.'
    },
    {
      question: 'How do I get started?',
      answer: 'Simply create a free account, complete your profile, and start learning! Visit our registration page to get started.'
    },
    {
      question: 'Are the courses in English?',
      answer: 'Yes, our courses are in English with clear, simple explanations suitable for all learners. We plan to add local language support in the future.'
    },
    {
      question: 'Can I access AquaLearn on my phone?',
      answer: 'Absolutely! AquaLearn is designed with a mobile-first approach, so all features work perfectly on smartphones and tablets.'
    },
    {
      question: 'How long do I have access to courses?',
      answer: 'Once you enroll in a course, you have lifetime access to all its content. You can learn at your own pace and revisit materials anytime.'
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <>
      <PageTitle title="FAQ" description="Frequently asked questions about AquaLearn and aquaculture courses." />
      
      <div className="min-h-screen bg-sea-foam">
        {/* Hero */}
        <section className="bg-gradient-to-br from-deep-ocean to-dark-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Frequently Asked Questions</h1>
              <p className="text-gray-300 text-lg">
                Find answers to the most common questions about AquaLearn.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* FAQ List */}
        <section className="py-16 px-4 max-w-3xl mx-auto">
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 50}>
                <div className="bg-white rounded-brand-lg shadow-card overflow-hidden hover:shadow-card-hover transition-all duration-300">
                  <button
                    onClick={() => toggleFAQ(index)}
                    className="w-full px-6 py-4 text-left flex justify-between items-center hover:bg-deep-ocean/5 transition-colors"
                  >
                    <span className="font-medium text-deep-ocean">{faq.question}</span>
                    <span className={`text-2xl text-deep-ocean transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}>
                      {openIndex === index ? '−' : '+'}
                    </span>
                  </button>
                  <div className={`overflow-hidden transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96' : 'max-h-0'}`}>
                    <div className="px-6 pb-4 text-dark-navy/80">
                      {faq.answer}
                    </div>
                  </div>
                </div>
              </AnimatedSection>
            ))}
          </div>

          {/* Still have questions */}
          <AnimatedSection animation="fade-up" delay={300}>
            <div className="mt-12 text-center bg-white rounded-brand-lg shadow-card p-8 hover:shadow-card-hover transition-all duration-300">
              <h3 className="text-xl font-bold text-deep-ocean mb-2">
                Still have questions?
              </h3>
              <p className="text-dark-navy/70 mb-4">
                We're here to help! Contact us and we'll get back to you.
              </p>
              <Link
                to="/contact"
                className="bg-deep-ocean text-white px-6 py-2 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 inline-block"
              >
                Contact Us
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </>
  );
};

export default FAQ;