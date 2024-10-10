import Navbar from "./Navbar";
import { Outlet } from "react-router-dom";
import "./components.css"

export default function Layout() {
  return (
    <div className="layout">
      <Navbar />
      <Outlet />
    </div>
  );
}