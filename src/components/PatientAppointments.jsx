import React, { useEffect, useState } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils"; // You can replace this with the actual API endpoint if needed
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";

const PatientAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cancelLoading, setCancelLoading] = useState(false);

  const navigate = useNavigate();
  const user = useSelector((state) => state.auth.user);
  const status = useSelector((state) => state.auth.status);

  console.log(user);

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
      setCancelLoading(true);
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
        setCancelLoading(false);

        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setCancelLoading(false);

      // Update the state after successfully canceling
      setAppointments((prevAppointments) =>
        prevAppointments.filter(
          (appointment) => appointment._id !== appointmentId
        )
      );
      alert("Appointment canceled successfully.");
    } catch (error) {
      setCancelLoading(false);

      console.error("Error canceling appointment:", error);
      alert("An error occurred while canceling the appointment.");
    }
  };

  const isCancelable = (appointmentDate) => {
    // Get the current date and reset the time to midnight to only compare the date
    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    // Convert the appointment's date to a Date object
    const appointmentDateObj = new Date(appointmentDate);
    appointmentDateObj.setHours(0, 0, 0, 0);

    // If the current date is earlier than the appointment date, return true to show the button
    return currentDate < appointmentDateObj;
  };

  if (!user && status === "loading") return <div>Loading...</div>;
  if (!user && status === "succeeded") {
    navigate("/login");
    return;
  }

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Your Appointments
      </h1>

      {appointments.length === 0 ? (
        <div className="text-center text-gray-600">
          <p>You have no upcoming appointments.</p>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-lg shadow-md">
          {appointments.map((appointment, index) => (
            <div key={index} className="mb-6 border-b pb-6">
              <h2 className="text-2xl font-semibold">
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
                {appointment.status === "scheduled" ? "Scheduled" : "cancelled"}
              </p>

              {/* Show the cancel button only if the current date is earlier than the appointment date */}
              {appointment.status === "scheduled" &&
                isCancelable(appointment.date) && (
                  <button
                    disabled={cancelLoading}
                    className="cursor-pointer mt-4 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700"
                    onClick={() => handleCancelAppointment(appointment._id)}
                  >
                    {cancelLoading ? "Cancelling..." : "Cancel Appointment"}
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
