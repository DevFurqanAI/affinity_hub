import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";

function MainLayout() {
  return (
    <div className="min-h-screen bg-slate-50">
      <Navbar />

      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <Sidebar />

        <main className="min-h-[calc(100vh-96px)] flex-1 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default MainLayout;