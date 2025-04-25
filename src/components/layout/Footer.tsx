
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4 z-50">
      <div className="container mx-auto px-4 flex items-center justify-center text-center text-sm text-gray-600 dark:text-gray-400">
        <img 
          src="/lovable-uploads/48331f19-76fe-409d-9a1d-f0861cac4194.png" 
          alt="Treasure Book Logo" 
          className="h-10 mr-4"
        />
        <p>
          &copy; {currentYear} Developed by Siva - Kuat Technologies. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
