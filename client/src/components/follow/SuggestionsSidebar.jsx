import { useEffect, useState } from "react";
import toast from "react-hot-toast";

import Loader from "../common/Loader.jsx";
import UserCard from "../common/UserCard.jsx";
import FollowButton from "../profile/FollowButton.jsx";
import followService from "../../services/followService.js";
import useAuthStore from "../../store/authStore.js";

function SuggestionsSidebar() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  const [suggestions, setSuggestions] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadSuggestions = async () => {
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
  };

  useEffect(() => {
    if (isAuthenticated) {
      loadSuggestions();
    }
  }, [isAuthenticated]);

  const handleSuggestionFollowed = (userId) => {
    setSuggestions((previousSuggestions) =>
      previousSuggestions.filter((user) => user._id !== userId)
    );
  };

  if (!isAuthenticated) {
    return null;
  }

  return (
    <aside className="hidden w-72 shrink-0 xl:block">
      <div className="sticky top-24 rounded-3xl border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Who to follow
            </h2>
            <p className="text-xs text-slate-500">
              Suggested active users
            </p>
          </div>

          <button
            type="button"
            onClick={loadSuggestions}
            className="rounded-full px-3 py-1 text-xs font-semibold text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          >
            Refresh
          </button>
        </div>

        <div className="mt-4 space-y-3">
          {isLoading ? <Loader text="Loading..." /> : null}

          {!isLoading && suggestions.length === 0 ? (
            <p className="rounded-2xl bg-slate-50 p-4 text-center text-sm text-slate-500">
              No suggestions right now.
            </p>
          ) : null}

          {!isLoading
            ? suggestions.map((user) => (
                <UserCard
                  key={user._id}
                  user={user}
                  rightElement={
                    <FollowButton
                      userId={user._id}
                      isFollowing={false}
                      onFollowChange={() => handleSuggestionFollowed(user._id)}
                    />
                  }
                />
              ))
            : null}
        </div>
      </div>
    </aside>
  );
}

export default SuggestionsSidebar;