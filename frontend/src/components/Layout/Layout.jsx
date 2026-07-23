import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import ScrollToTop from '../UI/ScrollToTop';

const Layout = ({ children }) => {
  // Debug
  console.log('🟢 Layout rendering, path:', window.location.pathname);
  
  return (
    <div className="min-h-screen bg-sea-foam">
      <Navbar />
      <main className="pt-16">
        {children}
      </main>
      <Footer />
      <ScrollToTop />
    </div>
  );
};

export default Layout;