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
        <span className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-sm text-[var(--color-text-muted)]">
          Search
        </span>
        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          className={`ui-input w-full rounded-full text-sm outline-none transition ${
            compact ? "py-2 pl-16 pr-4" : "py-3 pl-16 pr-5"
          }`}
        />

        <button
          type="submit"
          className="sr-only"
        >
          Search
        </button>
      </div>
    </form>
  );
}

export default SearchBar;
