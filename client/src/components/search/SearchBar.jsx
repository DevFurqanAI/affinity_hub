import { useState } from "react";
import { useNavigate } from "react-router-dom";

function SearchBar({
  placeholder = "Search Affinity Hub...",
  initialValue = "",
  compact = false
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  return (
    <form onSubmit={handleSubmit} className={compact ? "w-full" : "w-full"}>
      <div className="relative">
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`w-full rounded-full border border-slate-300 bg-slate-50 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-900 focus:bg-white focus:ring-2 focus:ring-slate-200 ${
            compact ? "px-4 py-2" : "px-5 py-3"
          }`}
        />

        <button
          type="submit"
          className={`absolute right-1 top-1/2 -translate-y-1/2 rounded-full bg-slate-900 text-sm font-semibold text-white transition hover:bg-slate-800 ${
            compact ? "px-3 py-1.5" : "px-4 py-2"
          }`}
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;