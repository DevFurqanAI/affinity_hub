import { useEffect, useState } from "react";
import { Search, X } from "lucide-react";
import { useNavigate } from "react-router-dom";

function SearchBar({
  placeholder = "Search Affinity Hub...",
  initialValue = "",
  compact = false
}) {
  const navigate = useNavigate();
  const [query, setQuery] = useState(initialValue);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  const handleSubmit = (event) => {
    event.preventDefault();

    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      navigate("/search", { replace: true });
      return;
    }

    navigate(`/search?q=${encodeURIComponent(trimmedQuery)}`);
  };

  const handleClear = () => {
    setQuery("");
    navigate("/search", { replace: true });
  };

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <label className="relative block">
        <span className="sr-only">Search Affinity Hub</span>

        <Search className="pointer-events-none absolute left-4 top-1/2 h-4.5 w-4.5 -translate-y-1/2 text-[var(--color-text-muted)]" />

        <input
          type="search"
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={placeholder}
          aria-label="Search users or posts"
          autoComplete="off"
          className={`ui-input w-full rounded-full border border-[var(--color-border)] bg-[var(--color-surface-muted)] pl-11 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:border-[var(--color-primary)] ${
            compact ? "py-2.5 pr-10" : "py-3.5 pr-11"
          }`}
        />

        {query ? (
          <button
            type="button"
            onClick={handleClear}
            aria-label="Clear search"
            className="absolute right-3.5 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full text-[var(--color-text-muted)] transition hover:bg-[var(--color-surface-elevated)] hover:text-[var(--color-text)]"
          >
            <X className="h-4 w-4" />
          </button>
        ) : null}
      </label>

      <button type="submit" className="sr-only">
        Search
      </button>
    </form>
  );
}

export default SearchBar;