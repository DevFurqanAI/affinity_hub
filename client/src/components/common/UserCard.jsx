import { Link } from "react-router-dom";

import StoryAvatar from "../stories/StoryAvatar.jsx";

function UserCard({ user, rightElement = null, onClick }) {
  return (
    <div className="group flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 transition-colors hover:bg-neutral-100 dark:hover:bg-zinc-900/70">
      <Link
        to={`/profile/${user?.username}`}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <StoryAvatar
          user={user}
          sizeClassName="h-11 w-11"
          textClassName="text-sm"
        />

        <div className="min-w-0 text-left">
          <p className="truncate text-sm font-bold text-neutral-900 dark:text-white">
            {user?.username || "unknown_user"}
          </p>

          <p className="mt-0.5 truncate text-xs text-neutral-500 dark:text-zinc-500">
            {user?.name || "Affinity Hub User"}
          </p>
        </div>
      </Link>

      {rightElement ? (
        <div className="shrink-0 pl-2">{rightElement}</div>
      ) : null}
    </div>
  );
}

export default UserCard;