import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const About = () => {
  const values = [
    {
      icon: '🤝',
      title: 'Trustworthy',
      description: 'Reliable, accurate information farmers can count on.',
    },
    {
      icon: '🌟',
      title: 'Approachable',
      description: 'Welcoming to beginners and small-scale farmers.',
    },
    {
      icon: '💪',
      title: 'Empowering',
      description: 'Enables users to improve their livelihoods.',
    },
    {
      icon: '🚀',
      title: 'Modern',
      description: 'Leverages technology for real-world solutions.',
    },
    {
      icon: '❤️',
      title: 'Caring',
      description: 'Genuinely invested in farmer success.',
    },
  ];

  return (
    <>
      <PageTitle 
        title="About" 
        description="Learn about AquaLearn's mission to empower Nigerian fish farmers with accessible aquaculture education." 
      />
      
      <div className="min-h-screen bg-sea-foam">
        {/* Hero */}
        <section className="bg-gradient-to-br from-deep-ocean to-dark-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">About AquaLearn</h1>
              <p className="text-gray-300 text-lg">
                Empowering Nigerian fish farmers through accessible aquaculture education.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Content */}
        <section className="py-16 px-4 max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-8 mb-8">
              <h2 className="text-2xl font-bold text-deep-ocean mb-4">Our Mission</h2>
              <p className="text-dark-navy/80 leading-relaxed">
                To empower Nigerian fish farmers with practical, accessible aquaculture education 
                that improves livelihoods, increases productivity, and builds a sustainable future 
                for the aquaculture industry.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={200}>
            <div className="bg-white rounded-brand-lg shadow-card p-8 mb-8">
              <h2 className="text-2xl font-bold text-deep-ocean mb-4">Our Vision</h2>
              <p className="text-dark-navy/80 leading-relaxed">
                A Nigeria where every fish farmer has access to the knowledge and skills needed 
                to succeed, contributing to food security, economic growth, and sustainable 
                aquaculture practices.
              </p>
            </div>
          </AnimatedSection>

          <AnimatedSection animation="fade-up" delay={300}>
            <div className="bg-white rounded-brand-lg shadow-card p-8 mb-8">
              <h2 className="text-2xl font-bold text-deep-ocean mb-4">The Problem We Solve</h2>
              <p className="text-dark-navy/80 leading-relaxed mb-4">
                Nigeria's aquaculture sector has enormous potential, but many small-scale farmers lack 
                access to practical, reliable training. AquaLearn bridges this gap by providing:
              </p>
              <ul className="space-y-2 text-dark-navy/80">
                <li className="flex items-start gap-2">
                  <span className="text-clear-teal">✓</span>
                  <span>Practical video tutorials in easy-to-understand language</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clear-teal">✓</span>
                  <span>Interactive quizzes to reinforce learning</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clear-teal">✓</span>
                  <span>Verifiable certificates to showcase skills</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-clear-teal">✓</span>
                  <span>Mobile-first design for accessibility anywhere</span>
                </li>
              </ul>
            </div>
          </AnimatedSection>

          {/* Values */}
          <AnimatedSection animation="fade-up" delay={400}>
            <h2 className="text-2xl font-bold text-deep-ocean text-center mb-8">Our Values</h2>
            <div className="grid md:grid-cols-3 gap-6">
              {values.map((value, index) => (
                <div key={index} className="bg-white rounded-brand-lg shadow-card p-6 text-center hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-3">{value.icon}</div>
                  <h3 className="font-semibold text-deep-ocean mb-2">{value.title}</h3>
                  <p className="text-sm text-dark-navy/70">{value.description}</p>
                </div>
              ))}
            </div>
          </AnimatedSection>

          {/* CTA */}
          <AnimatedSection animation="fade-up" delay={500}>
            <div className="text-center mt-12">
              <Link
                to="/register"
                className="bg-deep-ocean text-white px-8 py-3 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-105 hover:shadow-lg inline-block"
              >
                Join Our Community
              </Link>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </>
  );
};

export default About;