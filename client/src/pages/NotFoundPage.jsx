import { Link } from "react-router-dom";

import Button from "../components/common/Button.jsx";

function NotFoundPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-400">
          404 Error
        </p>

        <h1 className="mt-3 text-3xl font-bold text-slate-900">
          Page Not Found
        </h1>

        <p className="mt-3 text-sm leading-6 text-slate-500">
          The page you are looking for does not exist or may be added in a later
          module.
        </p>

        <div className="mt-6">
          <Link to="/">
            <Button>Back to Home</Button>
          </Link>
        </div>
      </div>
    </main>
  );
}

export default NotFoundPage;