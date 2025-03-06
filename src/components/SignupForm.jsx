import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { login } from "../features/auth";
import { useDispatch } from "react-redux";
import { toast } from "react-toastify";

const SignupForm = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [userType, setUserType] = useState("patient"); // Default to 'patient'
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    firstName: "",
    lastName: "",
    dateOfBirth: "",
    phone: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    // Doctor-specific fields
    specialty: "",
    experience: "",
    bio: "",
    location: {
      city: "",
      state: "",
      address: "",
    },
    consultationFee: "",
    consultationLocations: [],
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    const keys = name.split(".");

    if (keys.length > 1) {
      setFormData((prevData) => {
        const updatedData = { ...prevData };
        keys.reduce((acc, key, index) => {
          if (index === keys.length - 1) {
            acc[key] = value;
          } else {
            acc[key] = acc[key] || {};
          }
          return acc[key];
        }, updatedData);
        return updatedData;
      });
    } else {
      setFormData((prevData) => ({
        ...prevData,
        [name]: value,
      }));
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    console.log("Form submitted:", formData);
    try {
      const FetchLogin = await fetch(`${NODE_API_ENDPOINT}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ...formData, role: userType }),
      });
      if (!FetchLogin.ok) {
        throw new Error(
          "Failed to registering. Please check your credentials."
        );
      }
      const responseData = await FetchLogin.json();
      console.log("Registered successfully:", responseData);
      dispatch(login({ token: responseData.token, user: responseData.user }));
      navigate("/dashboard");
      toast.success("Registered successfully");
    } catch (error) {
      console.error("Error logging in:", error);
      // Display an error message to the user
      toast.error("Failed to registering. Please check your credentials.");
    }
  };

  return (
    <div className=" mx-auto p-6  rounded-lg shadow-xl  border border-gray-300 bg-teal-100">
      <div className="mx-auto p-8 rounded-xl bg-white">
        <h2 className="text-2xl font-bold text-center mb-4 text-teal-500">
          Sign Up
        </h2>

        {/* Role Selection (Doctor or Patient) */}
        <div className="flex justify-center mb-6 cursor-pointer">
          <button
            className={`cursor-pointer px-4 py-2 rounded-l-md ${
              userType === "patient" ? "bg-teal-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setUserType("patient")}
          >
            Patient
          </button>
          <button
            className={`cursor-pointer px-4 py-2 rounded-r-md ${
              userType === "doctor" ? "bg-teal-500 text-white" : "bg-gray-200"
            }`}
            onClick={() => setUserType("doctor")}
          >
            Doctor
          </button>
        </div>

        <form onSubmit={handleSignup} className="space-y-6">
          {/* Common Fields for Both Doctor and Patient */}
          <div className="mb-4">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

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
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="firstName"
              className="block text-sm font-medium text-gray-700"
            >
              First Name
            </label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="lastName"
              className="block text-sm font-medium text-gray-700"
            >
              Last Name
            </label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
            />
          </div>

          {userType === "patient" && (
            <>
              {/* Patient-specific Fields */}
              <div className="mb-4">
                <label
                  htmlFor="dateOfBirth"
                  className="block text-sm font-medium text-gray-700"
                >
                  Date of Birth
                </label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={formData.dateOfBirth}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="phone"
                  className="block text-sm font-medium text-gray-700"
                >
                  Phone
                </label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address.street"
                  className="block text-sm font-medium text-gray-700"
                >
                  Street Address
                </label>
                <input
                  type="text"
                  name="address.street"
                  value={formData.address.street}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address.city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  value={formData.address.city}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address.state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  value={formData.address.state}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="address.zipCode"
                  className="block text-sm font-medium text-gray-700"
                >
                  Zip Code
                </label>
                <input
                  type="text"
                  name="address.zipCode"
                  value={formData.address.zipCode}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>
            </>
          )}

          {userType === "doctor" && (
            <>
              {/* Doctor-specific Fields */}
              <div className="mb-4">
                <label
                  htmlFor="specialty"
                  className="block text-sm font-medium text-gray-700"
                >
                  Specialty
                </label>
                <input
                  type="text"
                  name="specialty"
                  value={formData.specialty}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="experience"
                  className="block text-sm font-medium text-gray-700"
                >
                  Years of Experience
                </label>
                <input
                  type="number"
                  name="experience"
                  value={formData.experience}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="bio"
                  className="block text-sm font-medium text-gray-700"
                >
                  Bio
                </label>
                <textarea
                  name="bio"
                  value={formData.bio}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="consultationFee"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consultation Fee
                </label>
                <input
                  type="number"
                  name="consultationFee"
                  value={formData.consultationFee}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
              </div>

              <div className="mb-4">
                <label
                  htmlFor="consultationLocations"
                  className="block text-sm font-medium text-gray-700"
                >
                  Consultation Locations
                </label>
                {/* This could be a dynamic array input for multiple locations */}
                <input
                  type="text"
                  name="consultationLocations[0].name"
                  placeholder="Consultation Location Name"
                  value={formData.consultationLocations[0]?.name || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                <input
                  type="text"
                  name="consultationLocations[0].address"
                  placeholder="Consultation Location Address"
                  value={formData.consultationLocations[0]?.address || ""}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md mb-2 focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-teal-500"
                />
                {/* Additional locations can be added dynamically */}
              </div>
            </>
          )}

          <button
            type="submit"
            className="cursor-pointer w-full bg-teal-500 text-white py-2 rounded-md hover:bg-teal-600 transition duration-300"
          >
            Sign Up
          </button>
          {/* Login Link */}
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-teal-500 hover:text-teal-600 font-semibold"
              >
                Log in here
              </Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default SignupForm;
