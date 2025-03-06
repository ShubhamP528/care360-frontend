import React from "react";
import { Link } from "react-router-dom";

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-teal-100 flex flex-col justify-center items-center p-6">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">
          Welcome to HealthConnect
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          Your gateway to seamless medical care, whether you're a patient or a
          doctor.
        </p>
        <p className="text-md text-gray-600">
          Join our community to find healthcare solutions or connect with
          patients!
        </p>
      </div>

      {/* Call to Action Section */}
      <div className="flex space-x-6">
        <Link to="/signup">
          <button className="px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300">
            Sign Up
          </button>
        </Link>

        <Link to="/login">
          <button className="px-6 py-3 bg-gray-200 text-teal-500 rounded-lg hover:bg-teal-100 transition duration-300">
            Log In
          </button>
        </Link>
      </div>
    </div>
  );
};

export default LandingPage;
