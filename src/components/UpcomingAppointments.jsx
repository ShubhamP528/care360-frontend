import React, { useState, useEffect } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils"; // Replace with actual endpoint
import { useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const UpcomingAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);

  console.log(user);

  useEffect(() => {
    const getUpcomingAppointments = async () => {
      try {
        const response = await fetch(
          `${NODE_API_ENDPOINT}/doctors/getAppointment/upcomming`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user?.token}`, // Replace with actual token
            },
          }
        ); // Replace with actual API endpoint
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        if (data.success) {
          setAppointments(data.upcomingAppointments);
        }
      } catch (error) {
        console.error("Error fetching upcoming appointments", error);
      }
    };
    if (user?.token) getUpcomingAppointments();
  }, [user?.token]);

  const handleAppointmentDetails = (appointmentId) => {
    navigate(`/doctor/appointments/${appointmentId}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Your Upcoming Appointments
      </h1>

      {/* Appointments list */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {appointments.length > 0 ? (
          appointments.map((appointment) => (
            <div
              key={appointment._id}
              className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
            >
              <h3 className="text-2xl font-semibold mb-2">
                Patient: {appointment.patient.user.firstName}{" "}
                {appointment.patient.user.lastName}
              </h3>
              <p className="text-sm font-medium text-gray-600 mb-1">
                <strong>Reason for Visit:</strong> {appointment.reason}
              </p>

              <p className="text-gray-600 text-sm mb-1">
                <strong>Date:</strong>{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-sm mb-1">
                <strong>Time:</strong> {appointment.startTime} -{" "}
                {appointment.endTime}
              </p>
              <p className="text-sm text-gray-600 mb-1">
                <strong>Location:</strong>{" "}
                {appointment.consultationLocation.name},{" "}
                {appointment.consultationLocation.address}
              </p>
            </div>
          ))
        ) : (
          <p className="text-center col-span-full text-lg text-gray-500">
            You have no upcoming appointments.
          </p>
        )}
      </div>
    </div>
  );
};

export default UpcomingAppointments;
