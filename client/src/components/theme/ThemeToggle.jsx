import useTheme from "../../hooks/useTheme.js";

const themeLabels = {
  light: "Light",
  dark: "Dark",
  system: "System"
};

const themeIcons = {
  light: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2" />
      <path d="M12 20v2" />
      <path d="m4.93 4.93 1.41 1.41" />
      <path d="m17.66 17.66 1.41 1.41" />
      <path d="M2 12h2" />
      <path d="M20 12h2" />
      <path d="m6.34 17.66-1.41 1.41" />
      <path d="m19.07 4.93-1.41 1.41" />
    </svg>
  ),
  dark: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79Z" />
    </svg>
  ),
  system: (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <rect x="3" y="4" width="18" height="13" rx="2" />
      <path d="M8 21h8" />
      <path d="M12 17v4" />
    </svg>
  )
};

function ThemeToggle({ className = "" }) {
  const { theme, setTheme, options } = useTheme();

  return (
    <div
      className={`w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-1 ${className}`}
      aria-label="Theme selection"
      role="group"
    >
      <div className="flex items-center gap-1">
        {options.map((option) => {
          const isActive = theme === option;
          const label = themeLabels[option] || option;

          return (
            <button
              key={option}
              type="button"
              onClick={() => setTheme(option)}
              aria-pressed={isActive}
              aria-label={`Use ${label.toLowerCase()} theme`}
              className={`flex flex-1 items-center justify-center gap-1.5 rounded-lg px-2 py-2 text-[10px] font-black uppercase tracking-wide transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] ${
                isActive
                  ? "bg-[var(--color-surface)] text-[var(--color-primary)] shadow-sm"
                  : "text-[var(--color-text-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-text)]"
              }`}
            >
              <span
                className={
                  isActive
                    ? "text-[var(--color-primary)]"
                    : "text-[var(--color-text-muted)]"
                }
              >
                {themeIcons[option]}
              </span>

              <span>{label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

export default ThemeToggle;