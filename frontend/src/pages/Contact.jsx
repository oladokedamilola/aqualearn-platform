import React, { useState } from 'react';
import { toast } from 'react-toastify';
import PageTitle from '../components/UI/PageTitle';
import AnimatedSection from '../components/UI/AnimatedSection';

const Contact = () => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // In production, you'd have a contact API endpoint
      await new Promise((resolve) => setTimeout(resolve, 1500));
      toast.success('Message sent successfully! We\'ll get back to you soon.');
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      toast.error('Failed to send message. Please try again.');
    }
    setLoading(false);
  };

  const contactInfo = [
    {
      icon: '📧',
      title: 'Email',
      info: 'support@aqualearn.com',
    },
    {
      icon: '📍',
      title: 'Location',
      info: 'Nigeria',
    },
    {
      icon: '⏰',
      title: 'Response Time',
      info: 'Within 24-48 hours',
    },
  ];

  return (
    <>
      <PageTitle title="Contact" description="Get in touch with the AquaLearn team for support or feedback." />
      
      <div className="min-h-screen bg-sea-foam">
        {/* Hero */}
        <section className="bg-gradient-to-br from-deep-ocean to-dark-navy text-white py-16 px-4">
          <div className="max-w-4xl mx-auto text-center">
            <AnimatedSection animation="fade-up">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Contact Us</h1>
              <p className="text-gray-300 text-lg">
                Have questions or feedback? We'd love to hear from you.
              </p>
            </AnimatedSection>
          </div>
        </section>

        {/* Contact Form */}
        <section className="py-16 px-4 max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8">
            {/* Contact Info */}
            <div className="md:col-span-1 space-y-4">
              {contactInfo.map((item, index) => (
                <AnimatedSection key={index} animation="fade-up" delay={index * 100}>
                  <div className="bg-white rounded-brand-lg shadow-card p-6 hover:shadow-card-hover transition-all duration-300">
                    <div className="text-2xl mb-2">{item.icon}</div>
                    <h3 className="font-semibold text-deep-ocean">{item.title}</h3>
                    <p className="text-sm text-dark-navy/70">{item.info}</p>
                  </div>
                </AnimatedSection>
              ))}
            </div>

            {/* Form */}
            <div className="md:col-span-2">
              <AnimatedSection animation="fade-up" delay={200}>
                <div className="bg-white rounded-brand-lg shadow-card p-8">
                  <h2 className="text-2xl font-bold text-deep-ocean mb-6">Send Us a Message</h2>
                  <form onSubmit={handleSubmit}>
                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-deep-ocean font-medium text-sm mb-2">
                          Your Name
                        </label>
                        <input
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-deep-ocean font-medium text-sm mb-2">
                          Email Address
                        </label>
                        <input
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                          required
                        />
                      </div>
                    </div>

                    <div className="mb-4">
                      <label className="block text-deep-ocean font-medium text-sm mb-2">
                        Subject
                      </label>
                      <input
                        type="text"
                        name="subject"
                        value={formData.subject}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition"
                        required
                      />
                    </div>

                    <div className="mb-6">
                      <label className="block text-deep-ocean font-medium text-sm mb-2">
                        Message
                      </label>
                      <textarea
                        name="message"
                        rows="6"
                        value={formData.message}
                        onChange={handleChange}
                        className="w-full px-4 py-3 border border-gray-300 rounded-brand focus:outline-none focus:border-deep-ocean focus:ring-2 focus:ring-deep-ocean/20 transition resize-none"
                        required
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={loading}
                      className="w-full bg-deep-ocean text-white py-3 px-4 rounded-brand font-medium hover:bg-deep-ocean/90 transition-all duration-300 hover:scale-[1.02] disabled:opacity-50"
                    >
                      {loading ? 'Sending...' : 'Send Message'}
                    </button>
                  </form>
                </div>
              </AnimatedSection>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default Contact;