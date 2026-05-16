import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import UserCard from "../common/UserCard.jsx";
import followService from "../../services/followService.js";

function FollowingModal({ userId, isOpen, onClose }) {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadFollowing = async () => {
      try {
        setIsLoading(true);

        const result = await followService.getFollowing(userId);

        setFollowing(result.data?.following || []);
      } catch (error) {
        const message =
          error.response?.data?.message || "Failed to load following";

        toast.error(message);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen && userId) {
      loadFollowing();
    }
  }, [isOpen, userId]);

  if (!isOpen) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 px-4 py-8">
      <div className="max-h-[85vh] w-full max-w-md overflow-y-auto rounded-3xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900">Following</h2>
            <p className="mt-1 text-sm text-slate-500">
              Users followed by this profile.
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-3 py-1 text-xl font-bold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            ×
          </button>
        </div>

        <div className="mt-6 space-y-3">
          {isLoading ? <Loader text="Loading following..." /> : null}

          {!isLoading && following.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              Not following anyone yet.
            </p>
          ) : null}

          {!isLoading
            ? following.map((user) => (
                <UserCard key={user._id} user={user} onClick={onClose} />
              ))
            : null}
        </div>
      </div>
    </div>
  );
}

export default FollowingModal;