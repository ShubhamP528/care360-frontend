import React, { useState, useEffect } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useSelector } from "react-redux";

// Modal Component
const Modal = ({ showModal, setShowModal, onClose, children }) => {
  if (!showModal) return null;
  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      setShowModal(false);
    }
  };
  return (
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex justify-center items-center mt-20">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md px-4 overflow-y-auto max-h-[90vh] my-8">
        {children}
        <button
          onClick={handleClose}
          className="cursor-pointer mt-4 w-full bg-gray-600 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Generate Time Slots
const generateTimeSlots = () => {
  const slots = [];
  for (let hour = 8; hour < 18; hour++) {
    slots.push(`${hour}:00 - ${hour}:30`);
    slots.push(`${hour}:30 - ${hour + 1}:00`);
  }
  return slots;
};

// Transform Appointments Data (extended to include location details)
const transformAppointments = (data) => {
  const locationMap = {};

  // Create a composite key for each consultation location.
  data.upcomingAllAppointments.consultationLocations.forEach((location) => {
    const key = `${location.name}-${location.address}`;
    locationMap[key] = {
      location: location.name,
      slots: [],
      details: {
        address: location.address,
        city: location.city,
        state: location.state,
      },
    };
  });

  // Use the same composite key when associating appointments.
  data.upcomingAllAppointments.upcomingAllAppointments.forEach(
    (appointment) => {
      const key = `${appointment.consultationLocation.name}-${appointment.consultationLocation.address}`;
      appointment.timeSlots.forEach((slot) => {
        if (locationMap[key]) {
          locationMap[key].slots.push({
            // Format the date as "YYYY-MM-DD"
            date: new Date(appointment.date).toISOString().split("T")[0],
            startTime: slot.startTime,
            endTime: slot.endTime,
            isBooked: slot.isBooked,
          });
        }
      });
    }
  );

  return Object.values(locationMap);
};

const ConsultationLocations = () => {
  const [consultationData, setConsultationData] = useState([]);
  const [showLocationModal, setShowLocationModal] = useState(false);
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [updateLocationModal, setUpdateLocationModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  // State for new location (Add)
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [newLocationCity, setNewLocationCity] = useState("");
  const [newLocationState, setNewLocationState] = useState("");
  // State for updating location details
  const [updateLocationDetails, setUpdateLocationDetails] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
  });
  const user = useSelector((state) => state.auth.user);

  // Set min date to tomorrow for the date input
  useEffect(() => {
    const today = new Date();
    today.setDate(today.getDate() + 1);
    const day = String(today.getDate()).padStart(2, "0");
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const year = today.getFullYear();
    const formattedTomorrow = `${year}-${month}-${day}`;
    const inputElement = document.getElementById("dateInput");
    if (inputElement) {
      inputElement.setAttribute("min", formattedTomorrow);
    }
  }, []);

  // Fetch Consultation Data
  useEffect(() => {
    const fetchConsultationData = async () => {
      try {
        const response = await fetch(
          `${NODE_API_ENDPOINT}/doctors/doctor/profile`,
          {
            method: "GET",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${user.token}`,
            },
          }
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        if (data.success) setConsultationData(transformAppointments(data));
      } catch (error) {
        console.error("Error fetching consultation locations", error);
      }
    };
    if (user.token) fetchConsultationData();
  }, [user.token]);

  // Add a new slot and update the UI
  const handleAddSlot = async () => {
    if (!selectedDate || !selectedSlot) return;
    // Retrieve the location details from consultationData
    const locationObj = consultationData.find(
      (loc) => loc.location === selectedLocation
    );
    const newSlot = {
      date: new Date(selectedDate).toISOString().split("T")[0],
      startTime: selectedSlot.split(" - ")[0],
      endTime: selectedSlot.split(" - ")[1],
      isBooked: false,
    };
    const payload = {
      consultationLocation: {
        name: selectedLocation,
        address: locationObj?.details?.address || "",
        city: locationObj?.details?.city || "",
        state: locationObj?.details?.state || "",
      },
      date: new Date(selectedDate).toISOString(),
      timeSlots: [newSlot],
    };

    try {
      const response = await fetch(`${NODE_API_ENDPOINT}/availability`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
        body: JSON.stringify(payload),
      });
      if (!response.ok) throw new Error("Failed to add slot");
      const data = await response.json();
      if (data.success) {
        // Update local UI state by adding the new slot
        setConsultationData((prevData) =>
          prevData.map((loc) =>
            loc.location === selectedLocation
              ? { ...loc, slots: [...loc.slots, newSlot] }
              : loc
          )
        );
        setSelectedSlot("");
        setSelectedDate("");
        setShowSlotModal(false);
      }
    } catch (error) {
      console.error("Error adding slot", error);
    }
  };

  // Delete a slot and update the UI
  const handleDeleteSlot = async (locName, slotToDelete) => {
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/doctors/doctor/delete-slot`,
        {
          method: "POST", // Use DELETE if supported
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            consultationLocation: { name: locName },
            date: slotToDelete.date,
            timeSlot: {
              startTime: slotToDelete.startTime,
              endTime: slotToDelete.endTime,
            },
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to delete slot");
      const data = await response.json();
      if (data.success) {
        setConsultationData((prevData) =>
          prevData.map((loc) =>
            loc.location === locName
              ? {
                  ...loc,
                  slots: loc.slots.filter(
                    (s) =>
                      !(
                        s.date === slotToDelete.date &&
                        s.startTime === slotToDelete.startTime &&
                        s.endTime === slotToDelete.endTime
                      )
                  ),
                }
              : loc
          )
        );
      }
    } catch (error) {
      console.error("Error deleting slot", error);
    }
  };

  // Add a new location and update the UI
  const handleSaveLocation = async () => {
    if (
      !newLocationName ||
      !newLocationAddress ||
      !newLocationCity ||
      !newLocationState
    )
      return;
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/doctors/addConsultantLocation`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify({
            name: newLocationName,
            address: newLocationAddress,
            city: newLocationCity,
            state: newLocationState,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to add location");
      const data = await response.json();
      if (data.success) {
        const newLocation = {
          location: newLocationName,
          slots: [],
          details: {
            address: newLocationAddress,
            city: newLocationCity,
            state: newLocationState,
          },
        };
        setConsultationData([...consultationData, newLocation]);
        setNewLocationName("");
        setNewLocationAddress("");
        setNewLocationCity("");
        setNewLocationState("");
        setShowLocationModal(false);
      }
    } catch (error) {
      console.error("Error adding location", error);
    }
  };

  // Update an existing location and update the UI
  const handleUpdateLocation = async () => {
    if (
      !updateLocationDetails.name ||
      !updateLocationDetails.address ||
      !updateLocationDetails.city ||
      !updateLocationDetails.state
    )
      return;
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/doctors/doctor/update-location`,
        {
          method: "POST", // or PUT, depending on your API
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${user.token}`,
          },
          body: JSON.stringify(updateLocationDetails),
        }
      );
      if (!response.ok) throw new Error("Failed to update location");
      const data = await response.json();
      if (data.success) {
        setConsultationData((prevData) =>
          prevData.map((loc) =>
            loc.location === selectedLocation
              ? {
                  ...loc,
                  location: updateLocationDetails.name,
                  details: {
                    address: updateLocationDetails.address,
                    city: updateLocationDetails.city,
                    state: updateLocationDetails.state,
                  },
                }
              : loc
          )
        );
        setUpdateLocationModal(false);
        setSelectedLocation("");
      }
    } catch (error) {
      console.error("Error updating location", error);
    }
  };

  // Open update modal with prepopulated location details
  const handleEditLocation = (locationData) => {
    setSelectedLocation(locationData.location);
    setUpdateLocationDetails({
      name: locationData.location,
      address: locationData.details.address,
      city: locationData.details.city,
      state: locationData.details.state,
    });
    setUpdateLocationModal(true);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Consultation Locations & Slots
      </h1>
      <button
        onClick={() => setShowLocationModal(true)}
        className="cursor-pointer bg-blue-500 text-white p-2 mb-4 rounded"
      >
        Add Location
      </button>
      {consultationData.map((locationData) => (
        <div key={locationData.location} className="mb-6 border p-4 rounded">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-gray-800">
              {locationData.location}
            </h2>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setSelectedLocation(locationData.location);
                  setShowSlotModal(true);
                }}
                className="cursor-pointer bg-green-500 text-white p-2 rounded"
              >
                Add Slot
              </button>
              <button
                onClick={() => handleEditLocation(locationData)}
                className="cursor-pointer bg-yellow-500 text-white p-2 rounded"
              >
                Update Location
              </button>
            </div>
          </div>
          {locationData.slots.length > 0 ? (
            Object.entries(
              locationData.slots.reduce((acc, slot) => {
                if (!acc[slot.date]) acc[slot.date] = [];
                acc[slot.date].push(slot);
                return acc;
              }, {})
            ).map(([date, dateSlots]) => (
              <div key={date} className="mb-4">
                <h3 className="text-xl font-semibold text-gray-700 mb-2">
                  {date}
                </h3>
                <div className="grid grid-cols-3 gap-4">
                  {dateSlots.map((slot, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg text-white ${
                        slot.isBooked ? "bg-red-500" : "bg-green-500"
                      }`}
                    >
                      {`${slot.startTime} - ${slot.endTime}`}
                      {!slot.isBooked && (
                        <button
                          onClick={() =>
                            handleDeleteSlot(locationData.location, slot)
                          }
                          className="cursor-pointer ml-2 bg-red-600 text-white p-1 rounded"
                        >
                          Delete
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))
          ) : (
            <p className="text-gray-600">No available slots</p>
          )}
        </div>
      ))}
      {/* Add Slot Modal */}
      <Modal
        showModal={showSlotModal}
        onClose={() => {
          setShowSlotModal(false);
          setSelectedSlot("");
        }}
      >
        <h2 className="text-xl font-semibold">Select a 30-Minute Slot</h2>
        <input
          type="date"
          id="dateInput"
          value={selectedDate}
          onChange={(e) => setSelectedDate(e.target.value)}
          className="w-full p-2 border rounded my-2"
        />
        <div className="grid grid-cols-2 gap-2">
          {generateTimeSlots().map((slot, index) => {
            const slotExists = consultationData.some(
              (loc) =>
                loc.location === selectedLocation &&
                loc.slots.some(
                  (s) =>
                    s.date === selectedDate &&
                    s.startTime + " - " + s.endTime === slot
                )
            );
            return (
              <button
                key={index}
                onClick={() => !slotExists && setSelectedSlot(slot)}
                className={`cursor-pointer p-2 rounded ${
                  selectedSlot === slot
                    ? "bg-blue-700 text-white"
                    : slotExists
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-500 text-white"
                }`}
                disabled={slotExists}
              >
                {slot}
              </button>
            );
          })}
        </div>
        <button
          onClick={handleAddSlot}
          className="cursor-pointer mt-4 w-full bg-green-500 text-white p-2 rounded"
        >
          Confirm Slot
        </button>
      </Modal>
      {/* Add Location Modal */}
      <Modal
        showModal={showLocationModal}
        onClose={() => {
          setShowLocationModal(false);
          setNewLocationName("");
          setNewLocationAddress("");
          setNewLocationCity("");
          setNewLocationState("");
        }}
      >
        <h2 className="text-xl font-semibold">Add Location</h2>
        <input
          type="text"
          placeholder="Location Name"
          value={newLocationName}
          onChange={(e) => setNewLocationName(e.target.value)}
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="Address"
          value={newLocationAddress}
          onChange={(e) => setNewLocationAddress(e.target.value)}
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="City"
          value={newLocationCity}
          onChange={(e) => setNewLocationCity(e.target.value)}
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="State"
          value={newLocationState}
          onChange={(e) => setNewLocationState(e.target.value)}
          className="w-full p-2 border rounded my-2"
        />
        <button
          onClick={handleSaveLocation}
          className="cursor-pointer mt-4 w-full bg-green-500 text-white p-2 rounded"
        >
          Save Location
        </button>
      </Modal>
      {/* Update Location Modal */}
      <Modal
        showModal={updateLocationModal}
        onClose={() => {
          setUpdateLocationModal(false);
          setUpdateLocationDetails({
            name: "",
            address: "",
            city: "",
            state: "",
          });
        }}
      >
        <h2 className="text-xl font-semibold">Update Location</h2>
        <input
          type="text"
          placeholder="Location Name"
          value={updateLocationDetails.name}
          onChange={(e) =>
            setUpdateLocationDetails({
              ...updateLocationDetails,
              name: e.target.value,
            })
          }
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="Address"
          value={updateLocationDetails.address}
          onChange={(e) =>
            setUpdateLocationDetails({
              ...updateLocationDetails,
              address: e.target.value,
            })
          }
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="City"
          value={updateLocationDetails.city}
          onChange={(e) =>
            setUpdateLocationDetails({
              ...updateLocationDetails,
              city: e.target.value,
            })
          }
          className="w-full p-2 border rounded my-2"
        />
        <input
          type="text"
          placeholder="State"
          value={updateLocationDetails.state}
          onChange={(e) =>
            setUpdateLocationDetails({
              ...updateLocationDetails,
              state: e.target.value,
            })
          }
          className="w-full p-2 border rounded my-2"
        />
        <button
          onClick={handleUpdateLocation}
          className="cursor-pointer mt-4 w-full bg-green-500 text-white p-2 rounded"
        >
          Update Location
        </button>
      </Modal>
    </div>
  );
};

export default ConsultationLocations;
