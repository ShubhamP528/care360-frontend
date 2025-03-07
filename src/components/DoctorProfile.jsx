import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useSelector } from "react-redux";

// Loader component using Tailwind CSS animate-spin for mobile responsiveness
const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

// Transform API response: group slots by location
function transformConsultationData(data) {
  const locationMap = {};

  data.forEach((appointment) => {
    // Get matching location details from consultationLocations array
    const matchedLocation = appointment.doctor.consultationLocations.find(
      (loc) =>
        loc.name === appointment.consultationLocation.name &&
        loc.address === appointment.consultationLocation.address
    );
    if (!matchedLocation) return; // Skip if no match

    // Create a unique key using name and address
    const locationKey = `${appointment.consultationLocation.name}-${appointment.consultationLocation.address}`;
    const date = new Date(appointment.date).toISOString().split("T")[0];

    if (!locationMap[locationKey]) {
      locationMap[locationKey] = {
        location: appointment.consultationLocation.name,
        details: {
          address: appointment.consultationLocation.address,
          city: matchedLocation.city,
          state: matchedLocation.state,
          _id: matchedLocation._id,
        },
        slots: [],
      };
    }

    // Push each time slot (with date) into the location's slots array
    appointment.timeSlots.forEach((slot) => {
      locationMap[locationKey].slots.push({
        date: date,
        startTime: slot.startTime,
        endTime: slot.endTime,
        isBooked: slot.isBooked,
      });
    });
  });

  return Object.values(locationMap);
}

// Helper: group slots within a location by date
const groupSlotsByDate = (slots) => {
  return slots.reduce((acc, slot) => {
    if (!acc[slot.date]) {
      acc[slot.date] = [];
    }
    acc[slot.date].push(slot);
    return acc;
  }, {});
};

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loader, setLoader] = useState(false);
  const user = useSelector((state) => state.auth.user);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { doctorId } = useParams();

  // Extract doctor details (assuming the API returns an array of appointments)
  const extractDoctorDetails = (data) => ({
    name: data[0].doctor.user.firstName + " " + data[0].doctor.user.lastName,
    specialty: data[0].doctor.specialty,
    bio: data[0].doctor.bio,
    experience: data[0].doctor.experience,
    consultationFee: data[0].doctor.consultationFee,
    Location: data[0].doctor.location,
  });

  useEffect(() => {
    const fetchDoctorData = async () => {
      try {
        const response = await fetch(
          `${NODE_API_ENDPOINT}/availability/doctor/${doctorId}`
        );
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        // Extract doctor details and group slots by location
        const doctorDetails = extractDoctorDetails(data.data);
        const slotsByLocation = transformConsultationData(data.data);
        setDoctorData({ doctor: doctorDetails, slotsByLocation });
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    fetchDoctorData();
  }, [doctorId]);

  // Open booking modal for selected slot
  const handleBookSlot = (locationGroup, slot) => {
    setSelectedSlot({ locationGroup, slot });
    setIsModalOpen(true);
  };

  // Booking submission (with loader feedback)
  const handleSubmitBooking = async () => {
    if (reason.trim()) {
      try {
        setLoader(true);
        const response = await fetch(`${NODE_API_ENDPOINT}/appointments`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            doctorId,
            locationName: selectedSlot.locationGroup.location,
            locationAddress: selectedSlot.locationGroup.details.address,
            date: selectedSlot.slot.date,
            startTime: selectedSlot.slot.startTime,
            endTime: selectedSlot.slot.endTime,
            reason: reason,
          }),
        });
        if (!response.ok) {
          setLoader(false);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const bookingData = await response.json();
        if (bookingData.success) {
          setLoader(false);
          alert(
            `Booking confirmed for Dr. ${doctorData.doctor.name} at ${
              selectedSlot.slot.startTime
            } on ${new Date(
              selectedSlot.slot.date
            ).toLocaleDateString()} with the reason: "${reason}"`
          );
          // Update the booked slot in local state
          const updatedSlotsByLocation = doctorData.slotsByLocation.map(
            (group) => {
              if (group.location === selectedSlot.locationGroup.location) {
                return {
                  ...group,
                  slots: group.slots.map((s) =>
                    s.date === selectedSlot.slot.date &&
                    s.startTime === selectedSlot.slot.startTime
                      ? { ...s, isBooked: true }
                      : s
                  ),
                };
              }
              return group;
            }
          );
          setDoctorData({
            ...doctorData,
            slotsByLocation: updatedSlotsByLocation,
          });
          setIsModalOpen(false);
          setReason("");
        } else {
          setLoader(false);
          throw new Error("Booking failed.");
        }
      } catch (error) {
        setLoader(false);
        console.error("Error booking slot:", error);
        alert("An error occurred while booking the slot.");
        return;
      }
    } else {
      alert("Please provide a reason for the appointment.");
    }
  };

  if (!doctorData) {
    return <Loader />;
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <h1 className="text-2xl sm:text-3xl font-semibold text-center mb-6">
        Doctor Profile
      </h1>

      {/* Doctor Info */}
      <div className="bg-white p-4 sm:p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-xl sm:text-2xl font-semibold">
            Dr. {doctorData.doctor.name}
          </h2>
          <p className="text-teal-600 font-medium text-base sm:text-lg">
            {doctorData.doctor.specialty}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            <strong>Experience:</strong> {doctorData.doctor.experience} years
          </p>
        </div>

        {/* Bio, Fee, and Main Location */}
        <div className="mt-4">
          <h3 className="text-lg sm:text-xl font-medium">Bio:</h3>
          <p className="text-gray-700 mt-2">{doctorData.doctor.bio}</p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg sm:text-xl font-medium">Consultation Fee:</h3>
          <p className="text-gray-700 mt-2">
            ₹{doctorData.doctor.consultationFee}
          </p>
        </div>
        <div className="mt-4">
          <h3 className="text-lg sm:text-xl font-medium">Location:</h3>
          <p className="text-gray-700 mt-2">
            {doctorData.doctor.Location.address},{" "}
            {doctorData.doctor.Location.city},{" "}
            {doctorData.doctor.Location.state}
          </p>
        </div>

        {/* Consultation Locations with Grouped Slots */}
        {doctorData.slotsByLocation.map((locationGroup, index) => {
          // Group slots for this location by date
          const groupedSlots = groupSlotsByDate(locationGroup.slots);
          return (
            <div key={index} className="mt-6 border-t pt-4">
              <h3 className="text-xl sm:text-2xl font-semibold">
                Consultation Location: {locationGroup.location}
              </h3>
              <p className="text-gray-700 mt-2">
                {locationGroup.details.address}, {locationGroup.details.city},{" "}
                {locationGroup.details.state}
              </p>
              {Object.entries(groupedSlots).map(([date, slots]) => (
                <div key={date} className="mt-4">
                  <h4 className="text-lg sm:text-xl font-medium">
                    Available Slots for {new Date(date).toLocaleDateString()}:
                  </h4>
                  <ul className="mt-2 space-y-2">
                    {slots.map((slot, slotIndex) => (
                      <li
                        key={slotIndex}
                        className={`flex flex-col sm:flex-row sm:justify-between items-center text-gray-600 ${
                          slot.isBooked ? "line-through" : ""
                        }`}
                      >
                        <span>
                          {slot.startTime} - {slot.endTime}{" "}
                          {slot.isBooked ? (
                            <span className="text-red-500 ml-2">(Booked)</span>
                          ) : (
                            <span className="text-green-500 ml-2">
                              (Available)
                            </span>
                          )}
                        </span>
                        {!slot.isBooked && (
                          <button
                            onClick={() => handleBookSlot(locationGroup, slot)}
                            className="mt-2 sm:mt-0 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                          >
                            Book
                          </button>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        })}
      </div>

      {/* Modal for Booking */}
      {isModalOpen && (
        <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-sm">
            <h2 className="text-xl sm:text-2xl font-semibold mb-4">
              Provide Reason for Appointment
            </h2>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Enter your reason for the appointment"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows="4"
            ></textarea>
            <div className="mt-4 flex justify-between">
              <button
                disabled={loader}
                onClick={() => setIsModalOpen(false)}
                className="px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loader}
                onClick={handleSubmitBooking}
                className="px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors flex items-center justify-center"
              >
                {loader ? (
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
                        d="M4 12a8 8 0 018-8v8H4z"
                      ></path>
                    </svg>
                    Booking...
                  </>
                ) : (
                  "Book Appointment"
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
