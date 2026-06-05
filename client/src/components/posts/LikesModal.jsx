import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { X } from "lucide-react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import likeService from "../../services/likeService.js";

const PAGE_LIMIT = 20;

function LikesModal({ isOpen, postId, likesCount = 0, onClose }) {
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: PAGE_LIMIT,
    totalPages: 1,
    totalLikes: likesCount
  });
  const [isLoading, setIsLoading] = useState(false);

  const loadLikedUsers = async (page = 1, shouldReplace = true) => {
    if (!postId) {
      return;
    }

    try {
      setIsLoading(true);

      const result = await likeService.getPostLikedUsers(
        postId,
        page,
        PAGE_LIMIT
      );

      const loadedUsers = result.data?.users || [];
      const loadedPagination = result.data?.pagination || {
        page,
        limit: PAGE_LIMIT,
        totalPages: 1,
        totalLikes: loadedUsers.length
      };

      setUsers((previousUsers) =>
        shouldReplace ? loadedUsers : [...previousUsers, ...loadedUsers]
      );

      setPagination(loadedPagination);
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to load liked users"
      );
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (!isOpen) {
      return;
    }

    setUsers([]);
    setPagination({
      page: 1,
      limit: PAGE_LIMIT,
      totalPages: 1,
      totalLikes: likesCount
    });

    loadLikedUsers(1, true);
  }, [isOpen, postId]);

  useEffect(() => {
    if (!isOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;

    const handleKeyDown = (event) => {
      if (event.key === "Escape") {
        onClose?.();
      }
    };

    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) {
    return null;
  }

  const hasMore =
    pagination?.page && pagination?.totalPages
      ? pagination.page < pagination.totalPages
      : false;

  return (
    <div
      className="fixed inset-0 z-[90] flex items-end justify-center bg-black/70 p-0 backdrop-blur-sm sm:items-center sm:p-5"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose?.();
        }
      }}
    >
      <section
        className="flex max-h-[82vh] w-full flex-col overflow-hidden rounded-t-3xl border border-[var(--color-border)] bg-[var(--color-surface)] shadow-2xl sm:max-w-md sm:rounded-3xl"
        onMouseDown={(event) => event.stopPropagation()}
        aria-label="Liked by users"
      >
        <header className="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <div>
            <h2 className="text-lg font-black text-[var(--color-text)]">
              Liked by
            </h2>

            <p className="mt-0.5 text-xs text-[var(--color-text-muted)]">
              {pagination.totalLikes || likesCount || 0}{" "}
              {(pagination.totalLikes || likesCount) === 1 ? "person" : "people"}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close likes list"
            className="flex h-10 w-10 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
          >
            <X className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 overflow-y-auto px-3 py-3">
          {isLoading && users.length === 0 ? (
            <Loader text="Loading liked users..." />
          ) : null}

          {!isLoading && users.length === 0 ? (
            <div className="px-5 py-12 text-center">
              <p className="text-sm font-black text-[var(--color-text)]">
                No likes yet
              </p>

              <p className="mt-2 text-xs leading-5 text-[var(--color-text-muted)]">
                People who like this post will appear here.
              </p>
            </div>
          ) : null}

          {users.length > 0 ? (
            <div className="space-y-1">
              {users.map((user) => {
                const avatarText =
                  user?.name?.charAt(0)?.toUpperCase() || "A";

                return (
                  <Link
                    key={user._id}
                    to={`/profile/${user.username}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-2xl px-3 py-3 transition hover:bg-[var(--color-surface-muted)]"
                  >
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-sm font-black text-[var(--color-text-muted)]">
                      {user.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name || "User"}
                          loading="lazy"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        avatarText
                      )}
                    </div>

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-black text-[var(--color-text)]">
                        {user.name || "Affinity User"}
                      </p>

                      <p className="truncate text-xs text-[var(--color-text-muted)]">
                        @{user.username || "unknown_user"}
                      </p>

                      {user.bio ? (
                        <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-muted)]">
                          {user.bio}
                        </p>
                      ) : null}
                    </div>

                    <div className="hidden text-right text-[10px] font-semibold text-[var(--color-text-muted)] sm:block">
                      <p>{user.followersCount || 0}</p>
                      <p>followers</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          ) : null}

          {isLoading && users.length > 0 ? (
            <div className="py-4">
              <Loader text="Loading more users..." />
            </div>
          ) : null}

          {hasMore ? (
            <div className="flex justify-center px-3 py-4">
              <button
                type="button"
                onClick={() => loadLikedUsers(pagination.page + 1, false)}
                disabled={isLoading}
                className="w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-4 py-3 text-[10px] font-black uppercase tracking-[0.16em] text-[var(--color-text)] transition hover:bg-[var(--color-surface-elevated)] disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isLoading ? "Loading..." : "Load More"}
              </button>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  );
}

export default LikesModal;