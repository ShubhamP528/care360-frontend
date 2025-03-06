import React from "react";
import { useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";

const UserDashboard = () => {
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user.user);
  const status = useSelector((state) => state.auth.status);
  console.log(status);
  if (!user && status === "loading") return <div>Loading...</div>;
  if (!user && status === "succeeded") {
    navigate("/login");
    return;
  }

  return (
    <div className="min-h-screen bg-teal-100 flex flex-col justify-center items-center p-6">
      {/* Welcome Section */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-teal-600 mb-4">
          Welcome {user?.role === "doctor" ? "Doctor" : "Patient"}!
        </h1>
        <p className="text-lg text-gray-700 mb-6">
          {user?.role === "doctor"
            ? "You can manage your consultations, view patient requests, and more."
            : "Find doctors, book consultations, and track your health progress."}
        </p>
      </div>

      {/* User-specific Content Section */}
      <div className="flex space-x-6">
        {user?.role === "doctor" ? (
          <>
            <Link to="/doctor/appointments">
              <button className="cursor-pointer px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300">
                View Appointments
              </button>
            </Link>
            <Link to="/doctor/profile">
              <button className="cursor-pointer px-6 py-3 bg-gray-200 text-teal-500 rounded-lg hover:bg-teal-100 transition duration-300">
                Manage Profile
              </button>
            </Link>
          </>
        ) : (
          <>
            <Link to="/patient/appointments/booking">
              <button className="cursor-pointer px-6 py-3 bg-teal-500 text-white rounded-lg hover:bg-teal-600 transition duration-300">
                Book Appointment
              </button>
            </Link>
            <Link to="/patient/appointments">
              <button className="cursor-pointer px-6 py-3 bg-gray-200 text-teal-500 rounded-lg hover:bg-teal-100 transition duration-300">
                All Appointment
              </button>
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
