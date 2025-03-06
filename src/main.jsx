import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.jsx";
import { Provider } from "react-redux";
import store from "./store.js";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import SignupForm from "./components/SignupForm.jsx";
import LoginForm from "./components/LoginForm.jsx";
import LandingPage from "./components/LandingPage.jsx";
import { ToastContainer } from "react-toastify";
import UserDashboard from "./components/UserDashboard .jsx";
import Appointment from "./components/Appointment .jsx";
import DoctorProfile from "./components/DoctorProfile.jsx";
import PatientAppointments from "./components/PatientAppointments.jsx";
import UpcomingAppointments from "./components/UpcomingAppointments.jsx";
import ConsultationLocations from "./components/ConsultationLocations .jsx";

const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <App />,
    children: [
      {
        path: "/",
        element: <LandingPage />,
      },
      {
        path: "/register",
        element: <SignupForm />,
      },
      {
        path: "/login",
        element: <LoginForm />,
      },
      {
        path: "/dashboard",
        element: <UserDashboard />,
      },
      {
        path: "/patient/appointments/booking",
        element: <Appointment />,
      },
      {
        path: "/patient/appointments/booking/:doctorId",
        element: <DoctorProfile />,
      },
      {
        path: "/patient/appointments",
        element: <PatientAppointments />,
      },
      {
        path: "/doctor/appointments",
        element: <UpcomingAppointments />,
      },
      {
        path: "/doctor/profile",
        element: <ConsultationLocations />,
      },
    ],
  },
]);

createRoot(document.getElementById("root")).render(
  <StrictMode>
    <Provider store={store}>
      <RouterProvider router={appRouter} />
      <ToastContainer />
    </Provider>
  </StrictMode>
);
