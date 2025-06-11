// src/components/plantrip/Layout.tsx
import React, { ReactNode } from 'react';
// import Header from '@/components/Header'; // Assuming you have a Header component
// import Footer from '@/components/Footer'; // Assuming you have a Footer component

/**
 * Interface for Layout component props.
 * Defines the children prop as ReactNode to accept any valid React children.
 */
interface LayoutProps {
  children: ReactNode;
  title?: string; // Optional title for the layout
  description?: string; // Optional description for SEO/meta tags
}

/**
 * Layout component for trip planning pages.
 * Provides a consistent structure with a header, main content area, and a footer.
 */
const Layout: React.FC<LayoutProps> = ({ children, title = "JalanJajan - Plan Your Trip", description = "Find the best routes and snacks with AI-powered recommendations." }) => {
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Optional: You can put a Head component here if you want page-specific meta tags */}
      {/* <Head>
        <title>{title}</title>
        <meta name="description" content={description} />
      </Head> */}

      {/* <Header />  */}
      {/* Your global application header */}

      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children} {/* Main content goes here */}
        {title} - {description}
      </main>

      {/* <Footer />  */}
      {/* Your global application footer */}
    </div>
  );
};

export default Layout;