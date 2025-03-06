import React, { useEffect } from "react";
// import Navbar from "./Components/NavBar";
// import Footer from "./Components/Footer";
import { Outlet } from "react-router-dom";
// import { useDispatch } from "react-redux";
// import { retrieveAuth } from "./features/auth";
import "./App.css";
import Navbar from "./components/NavBar";
import Footer from "./components/Footer";
import { useDispatch } from "react-redux";
import { retriveAuth } from "./features/auth";

function App() {
  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(retriveAuth());
  }, [dispatch]);

  return (
    <>
      <div className="mb-16">
        <Navbar />
      </div>
      <Outlet />

      <Footer />
    </>
  );
}

export default App;
