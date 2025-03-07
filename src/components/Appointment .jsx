// import React, { useState, useEffect } from "react";
// import { NODE_API_ENDPOINT } from "../utils/utils";
// import { useNavigate } from "react-router-dom";

// const Appointment = () => {
//   const [doctors, setDoctors] = useState([]);
//   const navigate = useNavigate();

//   // Search filter states
//   const [searchTerm, setSearchTerm] = useState(""); // Single search term for all filters

//   // Filtered doctor list after applying search filters
//   const [filteredDoctors, setFilteredDoctors] = useState(doctors);

//   useEffect(() => {
//     const getDoctors = async () => {
//       try {
//         const response = await fetch(`${NODE_API_ENDPOINT}/doctors`); // Replace with your actual API endpoint
//         if (!response.ok) {
//           throw new Error(`HTTP error! status: ${response.status}`);
//         }
//         const data = await response.json();
//         setDoctors(data.data);
//       } catch (error) {
//         console.error("Error fetching doctors", error);
//       }
//     };
//     getDoctors();
//   }, []);

//   // Handle filtering logic
//   useEffect(() => {
//     let filteredList = doctors;

//     if (searchTerm) {
//       filteredList = filteredList.filter((doctor) => {
//         const searchStr = `${doctor.specialty} ${doctor.location.city} ${doctor.location.state} ${doctor.user.firstName} ${doctor.user.lastName}`;
//         return searchStr.toLowerCase().includes(searchTerm.toLowerCase());
//       });
//     }

//     setFilteredDoctors(filteredList);
//   }, [searchTerm, doctors]);

//   const handleAppointment = (doctor) => {
//     navigate(`/patient/appointments/booking/${doctor._id}`);
//   };

//   return (
//     <div className="max-w-7xl mx-auto p-6">
//       <h1 className="text-3xl font-semibold text-center mb-6">Find a Doctor</h1>

//       <div className="mb-6">
//         <div className="relative">
//           <input
//             type="text"
//             value={searchTerm}
//             onChange={(e) => setSearchTerm(e.target.value)}
//             placeholder="Search by Specialty, Location, or Doctor's Name"
//             className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
//           />
//           <button
//             onClick={() => setSearchTerm(searchTerm)}
//             className="cursor-pointer absolute right-4 top-3 text-teal-600 hover:text-teal-800"
//           >
//             🔍
//           </button>
//         </div>
//       </div>

//       {/* Doctors list */}
//       <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
//         {filteredDoctors.length > 0 ? (
//           filteredDoctors.map((doctor) => (
//             <div
//               key={doctor._id}
//               className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
//             >
//               <h3 className="text-2xl font-semibold mb-2">
//                 Dr. {doctor.user.firstName} {doctor.user.lastName}
//               </h3>
//               <p className="text-sm font-medium text-gray-600 mb-1">
//                 <strong>Specialty:</strong> {doctor.specialty}
//               </p>
//               <p className="text-sm text-gray-600 mb-1">
//                 <strong>Bio:</strong> {doctor.bio}
//               </p>
//               <p className="text-sm text-gray-600 mb-1">
//                 <strong>Experience:</strong> {doctor.experience} years
//               </p>
//               <p className="text-sm text-gray-600 mb-2">
//                 <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
//               </p>

//               <div className="mb-4">
//                 <h4 className="text-lg font-medium">Consultation Locations:</h4>
//                 <ul className="space-y-2">
//                   {doctor.consultationLocations.map((location) => (
//                     <li key={location._id} className="text-sm text-gray-600">
//                       <p>{location.name}</p>
//                       <p>
//                         {location.address}, {location.city}, {location.state}
//                       </p>
//                     </li>
//                   ))}
//                 </ul>
//               </div>

//               <button
//                 onClick={() => handleAppointment(doctor)}
//                 className="cursor-pointer w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
//               >
//                 Book Appointment
//               </button>
//             </div>
//           ))
//         ) : (
//           <p className="text-center col-span-full text-lg text-gray-500">
//             No doctors found matching your criteria.
//           </p>
//         )}
//       </div>
//     </div>
//   );
// };

// export default Appointment;

import React, { useState, useEffect } from "react";
import { NODE_API_ENDPOINT } from "../utils/utils";
import { useNavigate } from "react-router-dom";

// Loader Component
const Loader = () => (
  <div className="flex justify-center items-center py-6">
    <div className="animate-spin rounded-full h-10 w-10 border-4 border-t-4 border-gray-200 border-t-teal-600"></div>
  </div>
);

const Appointment = () => {
  const [doctors, setDoctors] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  // Search filter states
  const [searchTerm, setSearchTerm] = useState("");
  // Filtered doctor list after applying search filters
  const [filteredDoctors, setFilteredDoctors] = useState([]);

  // Fetch doctors on component mount
  useEffect(() => {
    const getDoctors = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(`${NODE_API_ENDPOINT}/doctors`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setDoctors(data.data);
      } catch (error) {
        console.error("Error fetching doctors", error);
      } finally {
        setIsLoading(false);
      }
    };
    getDoctors();
  }, []);

  // Apply search filter
  useEffect(() => {
    let filteredList = doctors;
    if (searchTerm) {
      filteredList = filteredList.filter((doctor) => {
        const searchStr = `${doctor.specialty} ${doctor.location.city} ${doctor.location.state} ${doctor.user.firstName} ${doctor.user.lastName}`;
        return searchStr.toLowerCase().includes(searchTerm.toLowerCase());
      });
    }
    setFilteredDoctors(filteredList);
  }, [searchTerm, doctors]);

  const handleAppointment = (doctor) => {
    navigate(`/patient/appointments/booking/${doctor._id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <h1 className="text-3xl font-semibold text-center mb-6">Find a Doctor</h1>

      <div className="mb-6">
        <div className="relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by Specialty, Location, or Doctor's Name"
            className="w-full px-4 py-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-teal-500"
          />
          <button
            onClick={() => setSearchTerm(searchTerm)}
            className="cursor-pointer absolute right-4 top-3 text-teal-600 hover:text-teal-800"
          >
            🔍
          </button>
        </div>
      </div>

      {isLoading ? (
        <Loader />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredDoctors.length > 0 ? (
            filteredDoctors.map((doctor) => (
              <div
                key={doctor._id}
                className="bg-white p-6 rounded-lg shadow-md hover:shadow-lg transition-shadow"
              >
                <h3 className="text-2xl font-semibold mb-2">
                  Dr. {doctor.user.firstName} {doctor.user.lastName}
                </h3>
                <p className="text-sm font-medium text-gray-600 mb-1">
                  <strong>Specialty:</strong> {doctor.specialty}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Bio:</strong> {doctor.bio}
                </p>
                <p className="text-sm text-gray-600 mb-1">
                  <strong>Experience:</strong> {doctor.experience} years
                </p>
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Consultation Fee:</strong> ₹{doctor.consultationFee}
                </p>

                <div className="mb-4">
                  <h4 className="text-lg font-medium">
                    Consultation Locations:
                  </h4>
                  <ul className="space-y-2">
                    {doctor.consultationLocations.map((location) => (
                      <li key={location._id} className="text-sm text-gray-600">
                        <p>{location.name}</p>
                        <p>
                          {location.address}, {location.city}, {location.state}
                        </p>
                      </li>
                    ))}
                  </ul>
                </div>

                <button
                  onClick={() => handleAppointment(doctor)}
                  className="cursor-pointer w-full py-2 bg-teal-600 text-white rounded-md hover:bg-teal-700 transition-colors"
                >
                  Book Appointment
                </button>
              </div>
            ))
          ) : (
            <p className="text-center col-span-full text-lg text-gray-500">
              No doctors found matching your criteria.
            </p>
          )}
        </div>
      )}
    </div>
  );
};

export default Appointment;
