import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import "./components.css"
import Footer from "./Footer";

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <section className="main-section">
        <Outlet />
      </section>
      <Footer />
    </div>
  );
}