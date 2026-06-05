import { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import FollowButton from "../profile/FollowButton.jsx";
import followService from "../../services/followService.js";
import useAuthStore from "../../store/authStore.js";

function NeutralAvatar({
  user,
  sizeClassName = "h-10 w-10",
  textClassName = "text-xs"
}) {
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div
      className={`flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] font-black text-[var(--color-text-muted)] ${sizeClassName} ${textClassName}`}
    >
      {user?.avatar ? (
        <img
          src={user.avatar}
          alt={user.name || "User avatar"}
          loading="lazy"
          decoding="async"
          className="h-full w-full object-cover"
        />
      ) : (
        avatarText
      )}
    </div>
  );
}

function SuggestionsSidebar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const currentUser = useAuthStore((state) => state.user);

  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuggestions = useCallback(async () => {
    try {
      setIsLoading(true);

      const result = await followService.getSuggestions();

      setSuggestions(result.data?.suggestions || []);
    } catch (error) {
      const message =
        error.response?.data?.message || "Failed to load suggestions";

      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
    } else {
      setSuggestions([]);
    }
  }, [isAuthenticated, loadSuggestions]);

  const handleSuggestionFollowed = (userId) => {
    setSuggestions((previousSuggestions) =>
      previousSuggestions.filter((user) => user._id !== userId)
    );

    window.dispatchEvent(new Event("affinity-refresh-stories"));
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="hidden lg:col-span-4 lg:block">
      <div className="sticky top-8 space-y-5">
        {currentUser ? (
          <div className="flex items-center justify-between rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            <Link
              to={`/profile/${currentUser.username}`}
              className="group flex min-w-0 items-center gap-2.5"
            >
              <NeutralAvatar
                user={currentUser}
                sizeClassName="h-10 w-10"
                textClassName="text-xs"
              />

              <div className="min-w-0">
                <p className="truncate text-xs font-black text-[var(--color-text)] group-hover:underline">
                  {currentUser.username}
                </p>

                <p className="mt-0.5 truncate text-[10px] font-bold text-rose-500">
                  {currentUser.name}
                </p>
              </div>
            </Link>
          </div>
        ) : null}

        <section className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-[11px] font-black uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
              Suggested for you
            </h2>

            <button
              type="button"
              onClick={loadSuggestions}
              disabled={isLoading}
              className="text-[11px] font-bold text-rose-500 transition hover:text-rose-400 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
            >
              Refresh
            </button>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-3.5">
            {isLoading && suggestions.length === 0 ? (
              <Loader text="Loading suggestions..." />
            ) : null}

            {!isLoading && suggestions.length === 0 ? (
              <div className="rounded-xl bg-[var(--color-surface-muted)] px-4 py-8 text-center">
                <p className="text-xs font-bold text-[var(--color-text)]">
                  No suggestions right now
                </p>

                <p className="mt-1 text-[11px] leading-5 text-[var(--color-text-muted)]">
                  New profile suggestions will appear here.
                </p>
              </div>
            ) : null}

            {suggestions.length > 0 ? (
              <div className="space-y-3">
                {suggestions.map((user) => (
                  <div
                    key={user._id}
                    className="flex items-center justify-between gap-3"
                  >
                    <Link
                      to={`/profile/${user.username}`}
                      className="group flex min-w-0 flex-1 items-center gap-2.5"
                    >
                      <NeutralAvatar
                        user={user}
                        sizeClassName="h-8 w-8"
                        textClassName="text-[11px]"
                      />

                      <div className="min-w-0">
                        <p className="truncate text-xs font-extrabold text-[var(--color-text)] group-hover:underline">
                          {user.username}
                        </p>

                        <p className="mt-0.5 max-w-[145px] truncate text-[10px] text-[var(--color-text-muted)]">
                          {user.name || "Suggested for you"}
                        </p>
                      </div>
                    </Link>

                    <FollowButton
                      userId={user._id}
                      isFollowing={false}
                      onFollowChange={() =>
                        handleSuggestionFollowed(user._id)
                      }
                      size="sm"
                      className="!border-0 !bg-transparent !px-0 !py-0 !shadow-none !text-[#0095f6] hover:!bg-transparent hover:!text-blue-500"
                    />
                  </div>
                ))}
              </div>
            ) : null}

            {isLoading && suggestions.length > 0 ? (
              <div className="mt-3 border-t border-[var(--color-border)] pt-2">
                <Loader text="Refreshing..." />
              </div>
            ) : null}
          </div>
        </section>

        <div className="px-1 pt-2 text-[9px] font-bold uppercase tracking-[0.18em] text-[var(--color-text-muted)]">
          <p>Affinity Core Platform</p>
          <p className="mt-1.5">&copy; 2026 Affinity Hub</p>
        </div>
      </div>
    </aside>
  );
}

export default SuggestionsSidebar;