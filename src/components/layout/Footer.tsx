
import React from 'react';

const Footer: React.FC = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 py-4">
      <div className="container mx-auto px-4 text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          &copy; {currentYear} Developed by Siva - Kuat Technologies. All Rights Reserved.
        </p>
      </div>
    </footer>
  );
};

export default Footer;
