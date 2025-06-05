import { Outlet } from "react-router-dom";
import Sidebar from "./../components/Sidebar";
import Navbar from "./../components/Navbar";

export default function Layout() {
  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <main className="flex-1 h-screen space-y-4 overflow-y-auto bg-gray-100 p- lg:mb-0 mb-16">
        <Navbar />
        <Outlet />
      </main>
    </div>
  );
}
