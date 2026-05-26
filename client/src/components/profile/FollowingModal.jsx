import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import UserCard from "../common/UserCard.jsx";
import followService from "../../services/followService.js";

function FollowingModal({ userId, isOpen, onClose }) {
  const [following, setFollowing] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen || !userId) {
      return undefined;
    }

    let isCancelled = false;

    const loadFollowing = async () => {
      try {
        setIsLoading(true);
        setFollowing([]);

        const result = await followService.getFollowing(userId);

        if (!isCancelled) {
          setFollowing(result.data?.following || []);
        }
      } catch (error) {
        if (!isCancelled) {
          const message =
            error.response?.data?.message || "Failed to load following";

          toast.error(message);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    };

    loadFollowing();

    return () => {
      isCancelled = true;
    };
  }, [isOpen, userId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const originalOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm"
      onMouseDown={onClose}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="following-title"
        onMouseDown={(event) => event.stopPropagation()}
        className="flex max-h-[82vh] w-full max-w-md flex-col overflow-hidden rounded-2xl border border-neutral-200 bg-white shadow-2xl dark:border-zinc-900 dark:bg-black"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-neutral-200 px-5 py-4 dark:border-zinc-900">
          <div>
            <h2
              id="following-title"
              className="text-base font-black tracking-tight text-neutral-900 dark:text-white"
            >
              Following
            </h2>

            <p className="mt-1 text-[11px] text-neutral-500 dark:text-zinc-500">
              Profiles followed by this user
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close following"
            className="flex h-8 w-8 items-center justify-center rounded-full text-xl text-neutral-500 transition hover:bg-neutral-100 hover:text-neutral-900 dark:text-zinc-500 dark:hover:bg-zinc-900 dark:hover:text-white"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="py-8">
              <Loader text="Loading following..." />
            </div>
          ) : null}

          {!isLoading && following.length === 0 ? (
            <div className="rounded-xl border border-dashed border-neutral-200 bg-neutral-50 px-4 py-10 text-center dark:border-zinc-800 dark:bg-zinc-950">
              <p className="text-sm font-bold text-neutral-700 dark:text-zinc-300">
                Not following anyone yet
              </p>

              <p className="mt-1 text-xs text-neutral-500 dark:text-zinc-500">
                Followed profiles will appear here.
              </p>
            </div>
          ) : null}

          {!isLoading && following.length > 0 ? (
            <div className="space-y-2">
              {following.map((user) => (
                <div
                  key={user._id}
                  className="rounded-xl transition hover:bg-neutral-50 dark:hover:bg-zinc-950"
                >
                  <UserCard user={user} onClick={onClose} />
                </div>
              ))}
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default FollowingModal;