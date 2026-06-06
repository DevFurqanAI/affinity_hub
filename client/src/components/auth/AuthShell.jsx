import { Link } from "react-router-dom";
import {
  Palette,
  ShieldCheck,
  Sparkles,
  Users
} from "lucide-react";

import AffinityHubLogo from "../branding/AffinityHubLogo.jsx";
import useTheme from "../../hooks/useTheme.js";

function AuthShell({
  eyebrow,
  title,
  description,
  children,
  footer,
  wide = false
}) {
  const { theme, setTheme } = useTheme();

  const handleSwitchAppearance = () => {
    setTheme(theme === "dark" ? "light" : "dark");
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-[var(--color-surface)] text-[var(--color-text)]">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[440px] w-[440px] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-52 right-0 h-[520px] w-[520px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-surface)_74%)]" />
      </div>

      <div
        className={`relative mx-auto min-h-screen w-full ${
          wide
            ? "flex max-w-6xl items-center justify-center px-4 py-8 sm:px-6"
            : "grid max-w-7xl lg:grid-cols-[minmax(390px,0.95fr)_minmax(500px,1.05fr)]"
        }`}
      >
        {!wide ? (
          <aside className="relative hidden overflow-hidden border-r border-[var(--color-border)] px-10 py-10 xl:px-14 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" aria-label="Affinity Hub Home">
                <AffinityHubLogo compact />
              </Link>

              <div className="mt-16 max-w-lg">
                <p className="text-[11px] font-black uppercase tracking-[0.34em] text-rose-500">
                  Public Lounge
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[var(--color-text)] xl:text-5xl">
                  Find your people.
                  <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                    Share your world.
                  </span>
                </h1>

                <p className="mt-6 text-base leading-8 text-[var(--color-text-muted)]">
                  A modern social space for profiles, stories, posts, and
                  meaningful connections across communities.
                </p>
              </div>

              <div className="mt-12 space-y-4">
                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[var(--color-text)]">
                      Personalized Timeline
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                      Discover posts, people, and moments that match your interests.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[var(--color-text)]">
                      Community Connections
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                      Follow people, share updates, and join active conversations.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-4 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-5">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-500/10 text-[#0095f6]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-sm font-black text-[var(--color-text)]">
                      Safer Social Space
                    </p>
                    <p className="mt-1 text-xs leading-5 text-[var(--color-text-muted)]">
                      Verification, reporting, and moderation built into the platform.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[11px] font-bold uppercase tracking-[0.22em] text-[var(--color-text-muted)]">
              © 2026 Affinity Hub
            </p>
          </aside>
        ) : null}

        <section
          className={`relative flex min-h-screen items-center justify-center ${
            wide ? "w-full" : "px-4 py-8 sm:px-8 lg:px-14"
          }`}
        >
          <button
            type="button"
            onClick={handleSwitchAppearance}
            aria-label="Switch appearance"
            className="absolute right-4 top-4 flex h-11 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-xs font-black text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:right-7 sm:top-7"
          >
            <Palette className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Appearance</span>
          </button>

          <div className={`w-full ${wide ? "max-w-5xl" : "max-w-lg"}`}>
            <div className={`mb-8 ${wide ? "" : "lg:hidden"}`}>
              <Link to="/" aria-label="Affinity Hub Home">
                <AffinityHubLogo compact />
              </Link>
            </div>

            <div className={wide ? "text-center" : ""}>
              <p className="text-[11px] font-black uppercase tracking-[0.28em] text-rose-500">
                {eyebrow}
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--color-text)] sm:text-4xl">
                {title}
              </h1>

              <p className="mt-3 text-base leading-7 text-[var(--color-text-muted)]">
                {description}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-2xl shadow-black/5 sm:p-7">
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-base text-[var(--color-text-muted)]">
                {footer}
              </div>
            ) : null}
          </div>
        </section>
      </div>
    </main>
  );
}

export default AuthShell;