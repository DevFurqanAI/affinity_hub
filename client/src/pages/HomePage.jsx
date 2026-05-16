import { Navigate, Link } from "react-router-dom";

import Button from "../components/common/Button.jsx";
import Card from "../components/common/Card.jsx";
import useAuthStore from "../store/authStore.js";

function HomePage() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  if (isAuthenticated) {
    return <Navigate to="/feed" replace />;
  }

  return (
    <main className="mx-auto max-w-5xl">
      <Card className="overflow-hidden" padding="p-0">
        <div className="grid gap-0 lg:grid-cols-2">
          <div className="p-8 sm:p-10 lg:p-12">
            <p className="text-sm font-bold uppercase tracking-wide text-slate-500">
              Semester MERN Project
            </p>

            <h1 className="mt-4 text-4xl font-black tracking-tight text-slate-900 sm:text-5xl">
              Welcome to Affinity Hub
            </h1>

            <p className="mt-5 text-base leading-8 text-slate-600">
              A modern social media platform with profiles, posts, stories,
              likes, comments, search, reports, admin moderation, and more.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link to="/register">
                <Button size="lg" className="w-full sm:w-auto">
                  Get Started
                </Button>
              </Link>

              <Link to="/login">
                <Button variant="outline" size="lg" className="w-full sm:w-auto">
                  Login
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex min-h-72 items-center justify-center bg-slate-900 p-8 text-white">
            <div className="max-w-sm text-center">
              <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-3xl bg-white text-3xl font-black text-slate-900">
                AH
              </div>

              <h2 className="mt-6 text-2xl font-bold">Connect. Share. Grow.</h2>

              <p className="mt-3 text-sm leading-6 text-slate-300">
                Designed with a clean, responsive interface for desktop and mobile.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </main>
  );
}

export default HomePage;