import logoUrl from "../../assets/branding/logo.png";

function AffinityHubLogo({
  compact = false,
  showText = true,
  className = ""
}) {
  return (
    <span className={`inline-flex min-w-0 items-center gap-3 ${className}`}>
      <span
        className={`flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-transparent ${
          compact ? "h-9 w-9" : "h-9 w-9"
        }`}
      >
        <img
          src={logoUrl}
          alt="Affinity Hub"
          className="h-full w-full object-contain"
          draggable="false"
        />
      </span>

      {showText ? (
        <span className={compact ? "hidden min-w-0 sm:block" : "min-w-0"}>
          <span className="block truncate bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-sm font-black uppercase leading-none tracking-tight text-transparent">
            AFFINITY HUB
          </span>
        </span>
      ) : null}
    </span>
  );
}

export default AffinityHubLogo;
