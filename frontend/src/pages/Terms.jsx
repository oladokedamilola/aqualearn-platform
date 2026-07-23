import React from 'react';
import { Link } from 'react-router-dom';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const Terms = () => {
  return (
    <>
      <PageTitle title="Terms of Service" description="AquaLearn's terms of service for using the platform." />
      
      <div className="min-h-screen bg-sea-foam">
        <section className="bg-gradient-to-br from-deep-ocean to-dark-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Terms of Service</h1>
              <p className="text-gray-300 text-lg">Please read these terms carefully before using AquaLearn.</p>
            </AnimatedSection>
          </div>
        </section>

        <section className="py-16 px-4 max-w-4xl mx-auto">
          <AnimatedSection animation="fade-up">
            <div className="bg-white rounded-brand-lg shadow-card p-8 space-y-8">
              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">1. Acceptance of Terms</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  By accessing or using AquaLearn, you agree to be bound by these Terms of Service. 
                  If you disagree with any part of the terms, you may not access the platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">2. User Accounts</h2>
                <p className="text-dark-navy/80 leading-relaxed">To access the platform, you must create an account. You are responsible for:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Providing accurate and complete information</li>
                  <li>Maintaining the security of your password</li>
                  <li>All activities that occur under your account</li>
                  <li>Notifying us of any unauthorized use</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">3. Content</h2>
                <p className="text-dark-navy/80 leading-relaxed">All content provided on AquaLearn is for educational purposes only. You may:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Access and view content for personal learning</li>
                  <li>Download certificates for your personal use</li>
                  <li>Share certificates with employers or institutions</li>
                </ul>
                <p className="text-dark-navy/80 leading-relaxed mt-2">You may not:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Redistribute or sell content</li>
                  <li>Create derivative works</li>
                  <li>Use content for commercial purposes without permission</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">4. User Conduct</h2>
                <p className="text-dark-navy/80 leading-relaxed">You agree to use the platform responsibly and not to:</p>
                <ul className="list-disc ml-6 mt-2 text-dark-navy/80 space-y-1">
                  <li>Harass or harm other users</li>
                  <li>Post inappropriate or offensive content</li>
                  <li>Attempt to gain unauthorized access</li>
                  <li>Disrupt or interfere with the platform</li>
                  <li>Use the platform for illegal purposes</li>
                </ul>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">5. Intellectual Property</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  All content on AquaLearn, including but not limited to text, graphics, logos, 
                  and software, is the property of AquaLearn and protected by copyright laws.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">6. Disclaimer of Warranties</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  The platform and content are provided "as is" without any warranties. While we 
                  strive for accuracy, we make no guarantees about the completeness or reliability 
                  of the information provided.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">7. Limitation of Liability</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  AquaLearn shall not be liable for any indirect, incidental, special, consequential, 
                  or punitive damages resulting from your use of the platform.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">8. Termination</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  We reserve the right to terminate or suspend accounts that violate these terms 
                  or engage in inappropriate behavior.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">9. Changes to Terms</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  We may update these terms from time to time. Changes will be posted on this page 
                  with an updated date.
                </p>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-deep-ocean mb-2">10. Contact</h2>
                <p className="text-dark-navy/80 leading-relaxed">
                  For questions about these terms, please <Link to="/contact" className="text-clear-teal hover:underline">contact us</Link>.
                </p>
              </div>

              <div className="text-sm text-dark-navy/60 pt-4 border-t border-gray-200">
                Last updated: July 2026
              </div>
            </div>
          </AnimatedSection>
        </section>
      </div>
    </>
  );
};

export default Terms;