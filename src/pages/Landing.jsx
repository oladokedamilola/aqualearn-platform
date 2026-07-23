import React, { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';
import PageTitle from '../components/UI/PageTitle';
import HeroCarousel from '../components/UI/HeroCarousel';
import AnimatedSection from '../components/UI/AnimatedSection';
import AnimatedCounter from '../components/UI/AnimatedCounter';

const Landing = () => {
  const { isAuthenticated } = useAuth();
  const location = useLocation();

  // ✅ Show logout message from navigation state
  useEffect(() => {
    if (location.state?.logoutMessage) {
      toast.success(location.state.logoutMessage);
      // Clear the state so it doesn't show again on refresh
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const features = [
    {
      icon: '🎥',
      title: 'Video Tutorials',
      description: 'Learn from practical video lessons taught by experienced aquaculture professionals.',
    },
    {
      icon: '📝',
      title: 'Interactive Quizzes',
      description: 'Test your knowledge with quizzes and get instant feedback on your progress.',
    },
    {
      icon: '📜',
      title: 'Verifiable Certificates',
      description: 'Earn certificates upon course completion that you can download and share.',
    },
    {
      icon: '📱',
      title: 'Mobile-First Design',
      description: 'Access all content on your phone, even with limited internet connectivity.',
    },
    {
      icon: '🌍',
      title: 'Local Content',
      description: 'Courses tailored specifically for Nigerian fish farming practices and conditions.',
    },
    {
      icon: '🎯',
      title: 'Practical Skills',
      description: 'Gain hands-on knowledge you can apply immediately on your farm.',
    },
  ];

  const stats = [
    { 
      id: 1,
      number: '50', 
      suffix: '+',
      label: 'Video Lessons' 
    },
    { 
      id: 2,
      number: '3', 
      suffix: '',
      label: 'Courses Available' 
    },
    { 
      id: 3,
      number: '100', 
      suffix: '+',
      label: 'Quiz Questions' 
    },
    { 
      id: 4,
      number: '100', 
      suffix: '%',
      label: 'Mobile Accessible' 
    },
  ];

  return (
    <>
      <PageTitle 
        title="Home" 
        description="Learn aquaculture online with AquaLearn. Free video tutorials, quizzes, and certificates for Nigerian fish farmers."
      />
      
      {/* Hero Carousel */}
      <HeroCarousel />

      {/* Stats Section */}
      <section className="py-12 px-4 bg-white">
        <div className="max-w-6xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-8">
          {stats.map((stat, index) => (
            <AnimatedSection key={stat.id} animation="fade-up" delay={index * 100}>
              <div className="text-center">
                <div className="text-3xl md:text-4xl font-bold text-deep-ocean">
                  <AnimatedCounter 
                    target={stat.number} 
                    suffix={stat.suffix}
                    duration={2000}
                  />
                </div>
                <div className="text-sm text-dark-navy/60">{stat.label}</div>
              </div>
            </AnimatedSection>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-6xl mx-auto">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold text-deep-ocean text-center mb-4">
              Why Choose AquaLearn?
            </h2>
            <p className="text-dark-navy/70 text-center max-w-2xl mx-auto mb-12">
              Everything you need to start or grow your fish farming business, all in one place.
            </p>
          </AnimatedSection>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                <div className="bg-white p-6 rounded-brand-lg shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-1">
                  <div className="text-4xl mb-4">{feature.icon}</div>
                  <h3 className="text-lg font-semibold text-deep-ocean mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-dark-navy/70 text-sm">{feature.description}</p>
                </div>
              </AnimatedSection>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-deep-ocean text-white py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <AnimatedSection animation="fade-up">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to Start Your Journey?
            </h2>
            <p className="text-gray-300 text-lg mb-8">
              Join hundreds of Nigerian fish farmers already learning with AquaLearn.
            </p>
            {!isAuthenticated && (
              <Link
                to="/register"
                className="inline-block bg-clear-teal text-white px-8 py-3 rounded-brand font-medium hover:bg-clear-teal/90 transition-all duration-300 hover:scale-105 hover:shadow-lg"
              >
                Get Started Now
              </Link>
            )}
          </AnimatedSection>
        </div>
      </section>
    </>
  );
};

export default Landing;