import React, { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import { logout } from "../features/auth";

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const user = useSelector((state) => state.auth.user.user);

  // Toggle mobile menu
  const handleMenuToggle = () => setIsOpen(!isOpen);

  // Close mobile menu when a menu item is clicked
  const handleLinkClick = () => setIsOpen(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  return (
    <header className="bg-teal-500 text-white fixed w-full top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="text-xl font-bold">MyLogo</div>

          {/* Mobile Hamburger Icon */}
          <div className="sm:hidden">
            <button
              onClick={handleMenuToggle}
              className="text-white focus:outline-none"
            >
              {isOpen ? (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              ) : (
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  strokeWidth="2"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              )}
            </button>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden sm:flex space-x-6">
            <Link
              to={user ? "/dashboard" : "/"}
              className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
            >
              Home
            </Link>

            {user ? (
              <Link
                onClick={handleLogout}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                Logout
              </Link>
            ) : (
              <Link
                to={"/login"}
                className="text-white hover:text-gray-300 px-3 py-2 rounded-md text-sm font-medium transition-colors duration-300"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="sm:hidden space-y-4 py-4 px-4">
            <Link
              to={user ? "/dashboard" : "/"}
              className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 transition-colors duration-300"
              onClick={handleLinkClick} // Close the menu when clicked
            >
              Home
            </Link>

            {user ? (
              <Link
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 transition-colors duration-300"
                onClick={() => {
                  handleLogout();
                  handleLinkClick();
                }} // Close the menu when clicked
              >
                Logout
              </Link>
            ) : (
              <Link
                to={"/login"}
                className="text-white block px-3 py-2 rounded-md text-base font-medium hover:text-gray-300 transition-colors duration-300"
                onClick={() => {
                  handleLinkClick();
                }} // Close the menu when clicked
              >
                Login
              </Link>
            )}
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
