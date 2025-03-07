import React, { useState, useEffect } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useSelector } from "react-redux";
import { FaTrash } from "react-icons/fa";

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center py-8">
    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
  </div>
);

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
    <div className="fixed inset-0 backdrop-blur-xs bg-opacity-50 flex justify-center items-center mt-10 sm:mt-20">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md px-4 overflow-y-auto max-h-[90vh] my-8">
        {children}
        <button
          onClick={handleClose}
          className="cursor-pointer mt-4 w-full sm:w-auto bg-gray-600 text-white p-2 rounded"
        >
          Close
        </button>
      </div>
    </div>
  );
};

// Generate Time Slots function
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
        _id: location._id,
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
            _id: slot._id,
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
  // New state variables for deletion confirmation
  const [slotToDelete, setSlotToDelete] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Loading states
  const [isFetchingData, setIsFetchingData] = useState(false);
  const [isAddingSlot, setIsAddingSlot] = useState(false);
  const [isDeletingSlot, setIsDeletingSlot] = useState(false);
  const [isSavingLocation, setIsSavingLocation] = useState(false);

  const [selectedLocation, setSelectedLocation] = useState(null);
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedSlot, setSelectedSlot] = useState("");
  // State for new location (Add)
  const [newLocationName, setNewLocationName] = useState("");
  const [newLocationAddress, setNewLocationAddress] = useState("");
  const [newLocationCity, setNewLocationCity] = useState("");
  const [newLocationState, setNewLocationState] = useState("");
  const user = useSelector((state) => state.auth.user);

  // Extract the fetch function so it can be reused.
  const fetchConsultationData = async () => {
    try {
      setIsFetchingData(true);
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
      console.log("Fetched consultation data:", data);
      if (data.success) {
        setConsultationData(transformAppointments(data));
      }
    } catch (error) {
      console.error("Error fetching consultation locations", error);
    } finally {
      setIsFetchingData(false);
    }
  };

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

  // Fetch consultation data when the component mounts or user token changes
  useEffect(() => {
    if (user.token) {
      fetchConsultationData();
    }
  }, [user.token]);

  // Add a new slot and update the UI
  const handleAddSlot = async () => {
    if (!selectedDate || !selectedSlot) return;
    setIsAddingSlot(true);
    // Retrieve the location details from consultationData
    const locationObj = consultationData.find(
      (loc) => loc.location === selectedLocation
    );
    let newSlot = {
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
        newSlot = { ...newSlot, _id: data.data.timeSlots[0]._id };
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
    } finally {
      setIsAddingSlot(false);
    }
  };

  // Delete a slot and update the UI
  const handleDeleteSlot = async (locName, slotToDelete) => {
    setIsDeletingSlot(true);
    try {
      const response = await fetch(
        `${NODE_API_ENDPOINT}/availability/${slotToDelete._id}`,
        {
          method: "DELETE",
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
    } finally {
      setIsDeletingSlot(false);
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
    setIsSavingLocation(true);
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
      console.log("Add location response:", data);
      // Instead of manually appending a new location,
      // refetch the consultation data from the backend to get the latest list.
      await fetchConsultationData();

      // Clear form inputs and close the modal.
      setNewLocationName("");
      setNewLocationAddress("");
      setNewLocationCity("");
      setNewLocationState("");
      setShowLocationModal(false);
    } catch (error) {
      console.error("Error adding location", error);
    } finally {
      setIsSavingLocation(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">
        Consultation Locations & Slots
      </h1>
      {isFetchingData ? (
        <Loader />
      ) : (
        <>
          <button
            onClick={() => setShowLocationModal(true)}
            className="cursor-pointer bg-blue-500 text-white p-2 mb-4 rounded"
          >
            Add Location
          </button>
          {consultationData.map((locationData, index) => (
            <div key={index} className="mb-6 border p-4 rounded">
              <div className="flex justify-between items-center flex-wrap">
                <h2 className="text-2xl font-semibold text-gray-800">
                  {locationData.location}
                </h2>
                <button
                  onClick={() => {
                    setSelectedLocation(locationData.location);
                    setShowSlotModal(true);
                  }}
                  className="cursor-pointer bg-green-500 text-white p-2 rounded mt-2 sm:mt-0"
                >
                  Add Slot
                </button>
              </div>
              {locationData.slots.length > 0 ? (
                Object.entries(
                  locationData.slots.reduce((acc, slot) => {
                    if (!acc[slot.date]) acc[slot.date] = [];
                    acc[slot.date].push(slot);
                    return acc;
                  }, {})
                ).map(([date, dateSlots], idx) => (
                  <div key={idx} className="mb-4">
                    <h3 className="text-xl font-semibold text-gray-700 mb-2">
                      {date}
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                      {dateSlots.map((slot, i) => (
                        <div
                          key={i}
                          className={`p-3 rounded-lg text-white flex justify-between items-center ${
                            slot.isBooked ? "bg-red-500" : "bg-green-500"
                          }`}
                        >
                          <span>{`${slot.startTime} - ${slot.endTime}`}</span>
                          {!slot.isBooked && (
                            <button
                              onClick={() => {
                                setSlotToDelete({
                                  locName: locationData.location,
                                  slot,
                                });
                                setShowDeleteModal(true);
                              }}
                              className="cursor-pointer ml-2 bg-red-600 hover:bg-red-700 transition-colors text-white p-2 rounded-full"
                            >
                              <FaTrash />
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
        </>
      )}
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
          disabled={isAddingSlot}
          className="cursor-pointer mt-4 w-full bg-green-500 text-white p-2 rounded flex justify-center items-center"
        >
          {isAddingSlot ? <Loader /> : "Confirm Slot"}
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
          disabled={isSavingLocation}
          className="cursor-pointer mt-4 w-full bg-green-500 text-white p-2 rounded flex justify-center items-center"
        >
          {isSavingLocation ? <Loader /> : "Save Location"}
        </button>
      </Modal>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <Modal
          showModal={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false);
            setSlotToDelete(null);
          }}
        >
          <h2 className="text-xl font-semibold mb-4">Confirm Deletion</h2>
          <p className="mb-4">Are you sure you want to delete this slot?</p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                if (slotToDelete) {
                  handleDeleteSlot(slotToDelete.locName, slotToDelete.slot);
                }
                setShowDeleteModal(false);
                setSlotToDelete(null);
              }}
              disabled={isDeletingSlot}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded mr-2 flex justify-center items-center"
            >
              {isDeletingSlot ? <Loader /> : "Delete"}
            </button>
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setSlotToDelete(null);
              }}
              className="bg-gray-300 hover:bg-gray-400 text-gray-700 px-4 py-2 rounded"
            >
              Cancel
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default ConsultationLocations;
