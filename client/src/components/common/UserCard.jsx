import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

function NeutralUserAvatar({
  user,
  sizeClassName = "h-11 w-11",
  textClassName = "text-sm"
}) {
  const avatarSource = user?.avatar || "";
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setHasError(false);
  }, [avatarSource]);

  return (
    <div
      className={`relative flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] font-black text-[var(--color-text-muted)] ${sizeClassName} ${textClassName}`}
    >
      {!avatarSource || !isLoaded || hasError ? <span>{avatarText}</span> : null}

      {avatarSource && !hasError ? (
        <img
          src={avatarSource}
          alt={user?.name || "User avatar"}
          loading="lazy"
          decoding="async"
          onLoad={() => setIsLoaded(true)}
          onError={() => setHasError(true)}
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-200 ${
            isLoaded ? "opacity-100" : "opacity-0"
          }`}
        />
      ) : null}
    </div>
  );
}

function UserCard({ user, rightElement = null, onClick }) {
  const profilePath = user?.username ? `/profile/${user.username}` : "/home";

  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-[var(--color-surface-muted)]">
      <Link
        to={profilePath}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <NeutralUserAvatar user={user} />

        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-black text-[var(--color-text)]">
            {user?.name || "Affinity Hub User"}
          </p>

          <p className="mt-0.5 truncate text-xs font-medium text-[var(--color-text-muted)]">
            @{user?.username || "unknown_user"}
          </p>

          {user?.bio ? (
            <p className="mt-1 line-clamp-1 text-xs text-[var(--color-text-muted)]">
              {user.bio}
            </p>
          ) : null}
        </div>
      </Link>

      {rightElement ? (
        <div className="shrink-0 pl-2">{rightElement}</div>
      ) : null}
    </div>
  );
}

export default UserCard;