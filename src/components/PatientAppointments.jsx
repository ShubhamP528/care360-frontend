import React, { useEffect, useState } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

// Reusable Loader Component
const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancellingId, setCancellingId] = useState(null);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(
          `${NODE_API_ENDPOINT}/patients/appointments`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setAppointments(data.data);
      } catch (error) {
        console.error("Error fetching appointments:", error);
        alert("An error occurred while fetching appointments.");
      } finally {
        setLoading(false);
      }
    };
    if (user.token) fetchAppointments();
  }, [user.token]);

  const handleCancelAppointment = async (appointmentId) => {
    const confirmation = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );
    if (!confirmation) return;

    try {
      setCancellingId(appointmentId);
      const response = await fetch(
        `${NODE_API_ENDPOINT}/appointments/${appointmentId}/cancel`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
        }
      );

      if (!response.ok) {
        setCancellingId(null);
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // Instead of removing the appointment, update its status to "cancelled"
      setAppointments((prevAppointments) =>
        prevAppointments.map((appointment) =>
          appointment._id === appointmentId
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );
      alert("Appointment cancelled successfully.");
    } catch (error) {
      console.error("Error canceling appointment:", error);
      alert("An error occurred while canceling the appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const isCancelable = (appointmentDate) => {
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);
    const appointmentDateObj = new Date(appointmentDate);
    appointmentDateObj.setHours(0, 0, 0, 0);
    return currentDate < appointmentDateObj;
  };

  if (!user && status === "loading") return <Loader />;
  if (!user && status === "succeeded") {
    navigate("/login");
    return null;
  }
  if (loading) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6">
        Your Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You have no upcoming appointments.</p>
        </div>
      ) : (
        <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
          {appointments.map((appointment) => (
            <div key={appointment._id} className="mb-6 border-b pb-6">
              <h2 className="text-xl sm:text-2xl font-semibold">
                Dr. {appointment.doctor.user.firstName}{" "}
                {appointment.doctor.user.lastName} -{" "}
                {appointment.doctor.specialty}
              </h2>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Consultation Location:</strong>{" "}
                {appointment.consultationLocation.name},{" "}
                {appointment.consultationLocation.address}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Date:</strong>{" "}
                {new Date(appointment.date).toLocaleDateString()}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Time:</strong> {appointment.startTime} -{" "}
                {appointment.endTime}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Reason for Visit:</strong> {appointment.reason}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                <strong>Status:</strong>{" "}
                {appointment.status === "scheduled" ? "Scheduled" : "Cancelled"}
              </p>

              {appointment.status === "scheduled" &&
                isCancelable(appointment.date) && (
                  <button
                    disabled={cancellingId === appointment._id}
                    onClick={() => handleCancelAppointment(appointment._id)}
                    className="cursor-pointer mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 flex items-center justify-center"
                  >
                    {cancellingId === appointment._id ? (
                      <>
                        <svg
                          className="animate-spin h-5 w-5 mr-2 text-white"
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                        >
                          <circle
                            className="opacity-25"
                            cx="12"
                            cy="12"
                            r="10"
                            stroke="currentColor"
                            strokeWidth="4"
                          ></circle>
                          <path
                            className="opacity-75"
                            fill="currentColor"
                            d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
                          ></path>
                        </svg>
                        Cancelling...
                      </>
                    ) : (
                      "Cancel Appointment"
                    )}
                  </button>
                )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PatientAppointments;
