import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-dark-navy text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🐟</span>
              <span className="text-xl font-bold text-white">AquaLearn</span>
            </div>
            <p className="text-sm text-gray-400">
              Learn aquaculture. Grow your future.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-white font-medium mb-4">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/courses" className="hover:text-clear-teal transition-colors">
                  Courses
                </Link>
              </li>
              <li>
                <Link to="/about" className="hover:text-clear-teal transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link to="/faq" className="hover:text-clear-teal transition-colors">
                  FAQ
                </Link>
              </li>
            </ul>
          </div>

          {/* Support */}
          <div>
            <h4 className="text-white font-medium mb-4">Support</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/contact" className="hover:text-clear-teal transition-colors">
                  Contact Us
                </Link>
              </li>
              <li>
                <Link to="/privacy" className="hover:text-clear-teal transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to="/terms" className="hover:text-clear-teal transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="text-white font-medium mb-4">Connect</h4>
            <p className="text-sm text-gray-400">
              Coming soon on social media!
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-700 mt-8 pt-8 text-center text-sm text-gray-400">
          © {currentYear} AquaLearn. All rights reserved.
          <span className="hidden sm:inline mx-2">•</span>
          <span className="block sm:inline">Made with ❤️ for Nigerian fish farmers</span>
        </div>
      </div>
    </footer>
  );
};

export default Footer;