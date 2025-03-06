import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useSelector } from "react-redux";

// Sample Doctor Data (Replace this with dynamic data from API)
// const doctor = {
//   consultationLocation: {
//     name: "Health Clinic A",
//     address: "789 Medical Rd",
//   },
//   doctor: {
//     location: {
//       city: "Los Angeles",
//       state: "CA",
//       address: "456 Health St",
//     },
//     user: {
//       firstName: "Jane",
//       lastName: "Smith",
//     },
//     specialty: "Cardiology",
//     experience: 10,
//     bio: "Experienced cardiologist with a passion for patient care.",
//     consultationFee: 100,
//     consultationLocations: [
//       {
//         name: "Health Clinic A",
//         address: "789 Medical Rd",
//         city: "Los Angeles",
//         state: "CA",
//       },
//       {
//         name: "Health Clinic B",
//         address: "101 Wellness Ave",
//         city: "Los Angeles",
//         state: "CA",
//       },
//     ],
//   },
//   date: "2025-03-10T00:00:00.000Z",
//   timeSlots: [
//     {
//       startTime: "09:00",
//       endTime: "09:30",
//       isBooked: false,
//     },
//     {
//       startTime: "10:00",
//       endTime: "10:30",
//       isBooked: true,
//     },
//     {
//       startTime: "14:00",
//       endTime: "14:30",
//       isBooked: false,
//     },
//   ],
// };

const DoctorProfile = () => {
  const [doctorData, setDoctorData] = useState(null);
  const [selectedSlot, setSelectedSlot] = useState(null);
  const [reason, setReason] = useState("");
  const [loader, setLoader] = useState(false);

  const user = useSelector((state) => state.auth.user);

  const [isModalOpen, setIsModalOpen] = useState(false);
  console.log(JSON.stringify(doctorData));
  const { doctorId } = useParams();

  const extractDetails = (data) => {
    const extractedData = {
      doctor: {},
      slots: [],
    };
    extractedData.doctor = {
      name: data[0].doctor.user.firstName + " " + data[0].doctor.user.lastName,
      specialty: data[0].doctor.specialty,
      bio: data[0].doctor.bio,
      experience: data[0].doctor.experience,
      consultationFee: data[0].doctor.consultationFee,
      Location: data[0].doctor.location,
    };

    data.forEach((slot) => {
      extractedData.slots.push({
        consultationLocation: slot.consultationLocation,
        date: slot.date,
        timeSlots: slot.timeSlots,
      });
    });
    return extractedData;
  };
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
        const resp = extractDetails(data.data);
        console.log(resp);
        setDoctorData(extractDetails(data.data));
      } catch (error) {
        console.error("Error fetching doctor data:", error);
      }
    };
    fetchDoctorData();
  }, [doctorId]);

  const handleBookSlot = async (slotData, slot) => {
    console.log(slotData, slot);
    setSelectedSlot({ slotData, slot });
    setIsModalOpen(true); // Open the modal to fill in the reason

    // Here you can implement the booking logic (e.g., API call to book the slot)
    // try {
    //   const response = await fetch(`${NODE_API_ENDPOINT}/appointments`, {
    //     method: "POST",
    //     headers: {
    //       "Content-Type": "application/json",
    //     },
    //     body: JSON.stringify({
    //       doctorId,
    //       locationName: slotData.consultationLocation.name,
    //       locationAddress: slotData.consultationLocation.address,
    //       date: slotData.date,
    //       startTime: slotData.startTime,
    //       endTime: slotData.endTime,
    //       reason: "Routine Checkup",
    //     }),
    //   });
    //   if (!response.ok) {
    //     throw new Error(`HTTP error! status: ${response.status}`);
    //   }
    //   const bookingData = await response.json();
    //   if (bookingData.success) {
    //     // Update the state to reflect the booking success
    //     // (e.g., update the slot status in the doctorData state)
    //   } else {
    //     throw new Error("Booking failed.");
    //   }
    // } catch (error) {
    //   console.error("Error booking slot:", error);
    //   alert("An error occurred while booking the slot.");
    //   return;
    // }
  };

  console.log(user);
  console.log(selectedSlot);

  // Handle the booking submission
  const handleSubmitBooking = async () => {
    if (reason.trim()) {
      // Here you can add the logic to book the slot

      // Here you can implement the booking logic (e.g., API call to book the slot)
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
            locationName: selectedSlot.slotData.consultationLocation.name,
            locationAddress: selectedSlot.slotData.consultationLocation.address,
            date: selectedSlot.slotData.date,
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
            `Booking confirmed for Dr. ${doctorData.doctor.name} at ${selectedSlot.startTime} with the reason: "${reason}"`
          );
          // Mark the slot as booked in the local state
          const updatedDoctorData = { ...doctorData };
          updatedDoctorData.slots.forEach((slotData) => {
            if (slotData.date === selectedSlot.slotData.date) {
              slotData.timeSlots.forEach((timeSlot) => {
                if (timeSlot.startTime === selectedSlot.slot.startTime) {
                  timeSlot.isBooked = true; // Mark this slot as booked
                }
              });
            }
          });
          setDoctorData(updatedDoctorData); // Update the state with the new booking
          setIsModalOpen(false); // Close the modal after booking
          setReason(""); // Reset the reason input
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

  if (doctorData === null) {
    return <div>Loading...</div>;
  }
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Doctor Profile
      </h1>

      {/* Doctor Info */}
      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="text-center">
          <h2 className="text-2xl font-semibold">
            Dr. {doctorData.doctor.name}
          </h2>
          <p className="text-teal-600 font-medium text-lg">
            {doctorData.doctor.specialty}
          </p>
          <p className="text-gray-600 text-sm mt-2">
            <strong>Experience:</strong> {doctorData.doctor.experience} years
          </p>
        </div>

        {/* Bio */}
        <div className="mt-4">
          <h3 className="text-xl font-medium">Bio:</h3>
          <p className="text-gray-700 mt-2">{doctorData.doctor.bio}</p>
        </div>

        {/* Consultation Fee */}
        <div className="mt-4">
          <h3 className="text-xl font-medium">Consultation Fee:</h3>
          <p className="text-gray-700 mt-2">
            ${doctorData.doctor.consultationFee}
          </p>
        </div>

        {/* Location */}
        <div className="mt-4">
          <h3 className="text-xl font-medium">Location:</h3>
          <p className="text-gray-700 mt-2">
            {doctorData.doctor.Location.address},{" "}
            {doctorData.doctor.Location.city},{" "}
            {doctorData.doctor.Location.state}
          </p>
        </div>

        {/* Consultation Locations and Availability */}
        {doctorData.slots.map((slotData, index) => (
          <div key={index} className="mt-6">
            <h3 className="text-2xl font-semibold">
              Consultation Location: {slotData.consultationLocation.name}
            </h3>
            <p className="text-gray-700 mt-2">
              {slotData.consultationLocation.address}
            </p>

            <h4 className="text-xl font-medium mt-4">
              Available Slots for {new Date(slotData.date).toLocaleDateString()}
              :
            </h4>
            <ul className="mt-2 space-y-2">
              {slotData.timeSlots.map((slot, slotIndex) => (
                <li
                  key={slotIndex}
                  className={`flex justify-between items-center text-gray-600 ${
                    slot.isBooked ? "line-through" : ""
                  }`}
                >
                  <span>
                    {slot.startTime} - {slot.endTime}
                    {slot.isBooked ? (
                      <span className="text-red-500 ml-2">(Booked)</span>
                    ) : (
                      <span className="text-green-500 ml-2">(Available)</span>
                    )}
                  </span>
                  {!slot.isBooked && (
                    <button
                      onClick={() => handleBookSlot(slotData, slot)}
                      className=" cursor-pointer ml-4 px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
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

      {/* Modal for Booking Slot */}
      {isModalOpen && (
        <div className="fixed inset-0  bg-opacity-50 backdrop-blur-xs flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h2 className="text-2xl font-semibold mb-4">
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
                disabled={loader} // Disable the booking button if loading
                onClick={() => setIsModalOpen(false)} // Close modal without booking
                className="cursor-pointer px-4 py-2 bg-gray-300 rounded-md hover:bg-gray-400 transition-colors"
              >
                Cancel
              </button>
              <button
                disabled={loader} // Disable the booking button if loading
                onClick={handleSubmitBooking} // Submit the booking
                className=" cursor-pointer px-4 py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
              >
                {loader ? "Booking..." : "Book Appointment"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DoctorProfile;
