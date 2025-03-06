import React from "react";

const Footer = () => {
  return (
    <footer className="bg-teal-500 text-white py-4">
      <div className="max-w-7xl mx-auto px-4 text-center">
        <p className="text-sm">
          &copy; {new Date().getFullYear()} MyCompany. All rights reserved.
        </p>
        <div className="mt-2">
          <a href="#" className="text-white hover:text-gray-300 text-sm mx-2">
            Privacy Policy
          </a>
          |
          <a href="#" className="text-white hover:text-gray-300 text-sm mx-2">
            Terms of Service
          </a>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
