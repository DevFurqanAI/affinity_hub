import { Link } from "react-router-dom";

function UserCard({ user, rightElement = null, onClick }) {
  const avatarText = user?.name?.charAt(0)?.toUpperCase() || "A";

  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-3 transition hover:bg-slate-50">
      <Link
        to={`/profile/${user?.username}`}
        onClick={onClick}
        className="flex min-w-0 flex-1 items-center gap-3"
      >
        <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-200 text-sm font-bold text-slate-700">
          {user?.avatar ? (
            <img
              src={user.avatar}
              alt={user.name}
              className="h-full w-full object-cover"
            />
          ) : (
            avatarText
          )}
        </div>

        <div className="min-w-0">
          <p className="truncate text-sm font-semibold text-slate-900">
            {user?.name}
          </p>

          <p className="truncate text-xs text-slate-500">@{user?.username}</p>
        </div>
      </Link>

      {rightElement ? <div className="shrink-0">{rightElement}</div> : null}
    </div>
  );
}

export default UserCard;