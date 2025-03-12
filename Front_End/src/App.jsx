import { useState } from "react";
import reactLogo from "./assets/react.svg";
import viteLogo from "/vite.svg";
import Header from "./layout/Header/Header";
import Footer from "./layout/Footer/Footer";
import { Outlet } from "react-router-dom";

function App() {
  return (
    <>
      <Header />
    
      <Outlet />
      <Footer />
    </>
  );
}

export default App;
