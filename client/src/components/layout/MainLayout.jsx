import { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";

import Navbar from "./Navbar.jsx";
import Sidebar from "./Sidebar.jsx";
import SearchDrawer from "../search/SearchDrawer.jsx";
import NotificationsDrawer from "../notifications/NotificationsDrawer.jsx";
import CreatePostBox from "../posts/CreatePostBox.jsx";

function MainLayout() {
  const [activeDrawer, setActiveDrawer] = useState(null);

  const isSearchDrawerOpen = activeDrawer === "search";
  const isNotificationsDrawerOpen = activeDrawer === "notifications";
  const isDrawerOpen = Boolean(activeDrawer);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        setActiveDrawer(null);
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isDrawerOpen]);

  useEffect(() => {
    const handleOpenCreatePost = () => {
      setActiveDrawer(null);
    };

    window.addEventListener("affinity-open-create-post", handleOpenCreatePost);

    return () => {
      window.removeEventListener(
        "affinity-open-create-post",
        handleOpenCreatePost
      );
    };
  }, []);

  const toggleSearchDrawer = () => {
    setActiveDrawer((currentDrawer) =>
      currentDrawer === "search" ? null : "search"
    );
  };

  const toggleNotificationsDrawer = () => {
    setActiveDrawer((currentDrawer) =>
      currentDrawer === "notifications" ? null : "notifications"
    );
  };

  const closeDrawers = () => {
    setActiveDrawer(null);
  };

  return (
    <div className="app-shell min-h-screen">
      <Navbar />

      <Sidebar
        isSearchDrawerOpen={isSearchDrawerOpen}
        isNotificationsDrawerOpen={isNotificationsDrawerOpen}
        onSearchToggle={toggleSearchDrawer}
        onNotificationsToggle={toggleNotificationsDrawer}
      />

      {isDrawerOpen ? (
        <button
          type="button"
          onClick={closeDrawers}
          aria-label="Close open panel"
          className="fixed inset-0 z-30 hidden bg-black/55 lg:block"
        />
      ) : null}

      <SearchDrawer
        isOpen={isSearchDrawerOpen}
        onClose={closeDrawers}
      />

      <NotificationsDrawer
        isOpen={isNotificationsDrawerOpen}
        onClose={closeDrawers}
      />

      <CreatePostBox modalOnly />

      <main className="min-h-screen min-w-0 pb-16 pt-16 lg:pb-0 lg:pl-18 lg:pt-20">
        <Outlet />
      </main>
    </div>
  );
}

export default MainLayout;