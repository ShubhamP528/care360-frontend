import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useDispatch } from "react-redux";
import { login } from "../features/auth";

const LoginForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      const FetchLogin = await fetch(`${NODE_API_ENDPOINT}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      if (!FetchLogin.ok) {
        throw new Error("Failed to log in. Please check your credentials.");
      }
      const responseData = await FetchLogin.json();
      console.log("Logged in successfully:", responseData);
      dispatch(login({ token: responseData.token, user: responseData.user }));
      navigate("/dashboard");
      toast.success("Logged in successfully");
    } catch (error) {
      console.error("Error logging in:", error);
      // Display an error message to the user
      toast.error("Failed to log in. Please check your credentials.");
    }
  };

  return (
    <div className="h-[80vh] flex items-center justify-center bg-teal-100 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full p-8 bg-white rounded-lg shadow-xl border border-gray-300">
        <h2 className="text-2xl font-bold text-center mb-6 text-teal-500">
          Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-6">
          {/* Email Field */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Gmail
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Password Field */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            className="w-full cursor-pointer bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition duration-300"
          >
            Log In
          </button>
        </form>

        {/* Registration Button */}
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">Don't have an account?</p>
          <Link
            to="/register" // Replace with actual registration route
            className="text-teal-500 hover:text-teal-600 font-semibold"
          >
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
