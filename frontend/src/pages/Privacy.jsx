import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const Privacy = () => {
  return (
    <>
      <PageTitle title="Privacy Policy" description="AquaLearn's privacy policy - how we protect and handle your data." />
      
      <div className="min-h-screen bg-sea-foam">
        <section className="bg-gradient-to-br from-deep-ocean to-dark-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Privacy Policy</h1>
              <p className="text-gray-300 text-lg">How we protect and handle your data.</p>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 px-4 max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Information We Collect</h2>
                <p className="text-dark-navy/80 leading-relaxed">We collect information you provide directly, such as:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Name and email address</li>
                  <li>Profile information (experience level, interests)</li>
                  <li>Learning progress and quiz results</li>
                  <li>Communications with us</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">How We Use Your Information</h2>
                <p className="text-dark-navy/80 leading-relaxed">We use your information to:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Provide and improve our educational services</li>
                  <li>Track your learning progress</li>
                  <li>Issue verifiable certificates</li>
                  <li>Send important updates and announcements</li>
                  <li>Respond to your inquiries</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Data Security</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  We implement appropriate security measures to protect your personal information. 
                  Your data is stored securely, and we use JWT authentication to protect your account.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Third-Party Services</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  We use YouTube for video hosting. YouTube's privacy policy applies to video content. 
                  We do not share your personal information with third parties.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Your Rights</h2>
                <p className="text-dark-navy/80 leading-relaxed">You have the right to:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Access your personal data</li>
                  <li>Request corrections to your data</li>
                  <li>Delete your account and data</li>
                  <li>Opt out of communications</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Updates to This Policy</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  We may update this policy from time to time. Changes will be posted on this page 
                  with an updated date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">Contact Us</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  If you have questions about this privacy policy, please <Link to="/contact" className="text-clear-teal hover:underline">contact us</Link>.
                </p>
              </div>

              <div className="text-sm text-dark-navy/60 pt-4 border-t border-gray-200">
                Last updated: January 2025
              </div>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </>
  );
};

export default Privacy;