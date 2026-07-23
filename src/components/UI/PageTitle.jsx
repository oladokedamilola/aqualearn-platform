import React from 'react';
import { Helmet } from 'react-helmet-async';

const PageTitle = ({ 
  title, 
  description = 'Learn aquaculture online with AquaLearn. Free video tutorials, quizzes, and certificates for Nigerian fish farmers.',
  keywords = 'aquaculture, fish farming, Nigeria, fish farming courses, online learning',
  author = 'AquaLearn'
}) => {
  const fullTitle = title ? `${title} | AquaLearn` : 'AquaLearn - Learn Aquaculture. Grow Your Future.';
  
  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <meta name="keywords" content={keywords} />
      <meta name="author" content={author} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content="website" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <link rel="canonical" href={window.location.href} />
    </Helmet>
  );
};

export default PageTitle;