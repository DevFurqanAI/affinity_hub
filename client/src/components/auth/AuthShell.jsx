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
      {/* Decorative Background */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
      >
        <div className="absolute -left-40 -top-40 h-[420px] w-[420px] rounded-full bg-rose-500/10 blur-3xl" />
        <div className="absolute -bottom-52 right-0 h-[500px] w-[500px] rounded-full bg-amber-500/10 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--color-surface)_72%)]" />
      </div>

      <div
        className={`relative mx-auto min-h-screen w-full ${
          wide
            ? "flex max-w-6xl items-center justify-center px-4 py-8 sm:px-6"
            : "grid max-w-7xl lg:grid-cols-[minmax(360px,0.92fr)_minmax(460px,1.08fr)]"
        }`}
      >
        {!wide ? (
          <aside className="relative hidden overflow-hidden border-r border-[var(--color-border)] px-10 py-10 lg:flex lg:flex-col lg:justify-between">
            <div>
              <Link to="/" aria-label="Affinity Hub Home">
                <AffinityHubLogo compact />
              </Link>

              <div className="mt-16 max-w-md">
                <p className="text-[10px] font-black uppercase tracking-[0.32em] text-rose-500">
                  Student Lounge
                </p>

                <h1 className="mt-5 text-4xl font-black leading-tight tracking-tight text-[var(--color-text)]">
                  Find your people.
                  <span className="block bg-gradient-to-r from-rose-500 via-pink-500 to-amber-400 bg-clip-text text-transparent">
                    Share your world.
                  </span>
                </h1>

                <p className="mt-5 text-sm leading-7 text-[var(--color-text-muted)]">
                  A modern university social space for stories, posts,
                  communities, and meaningful student connections.
                </p>
              </div>

              <div className="mt-12 space-y-3">
                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-rose-500/10 text-rose-500">
                    <Sparkles className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-[var(--color-text)]">
                      Personalized Timeline
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                      Discover posts based on your interests.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-amber-500/10 text-amber-500">
                    <Users className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-[var(--color-text)]">
                      Student Community
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                      Follow people and join the conversation.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/10 text-[#0095f6]">
                    <ShieldCheck className="h-5 w-5" />
                  </div>

                  <div>
                    <p className="text-xs font-black text-[var(--color-text)]">
                      Safer Social Space
                    </p>
                    <p className="mt-1 text-[11px] text-[var(--color-text-muted)]">
                      Verification and moderation built in.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
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
            className="absolute right-4 top-4 flex h-10 items-center gap-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-muted)] px-3 text-[11px] font-black text-[var(--color-text-muted)] transition hover:text-[var(--color-text)] sm:right-7 sm:top-7"
          >
            <Palette className="h-4 w-4 text-amber-500" />
            <span className="hidden sm:inline">Appearance</span>
          </button>

          <div className={`w-full ${wide ? "max-w-5xl" : "max-w-md"}`}>
            <div className={`mb-8 ${wide ? "" : "lg:hidden"}`}>
              <Link to="/" aria-label="Affinity Hub Home">
                <AffinityHubLogo compact />
              </Link>
            </div>

            <div className={wide ? "text-center" : ""}>
              <p className="text-[10px] font-black uppercase tracking-[0.28em] text-rose-500">
                {eyebrow}
              </p>

              <h1 className="mt-4 text-3xl font-black tracking-tight text-[var(--color-text)]">
                {title}
              </h1>

              <p className="mt-3 text-sm leading-6 text-[var(--color-text-muted)]">
                {description}
              </p>
            </div>

            <div className="mt-8 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-elevated)] p-5 shadow-2xl shadow-black/5 sm:p-7">
              {children}
            </div>

            {footer ? (
              <div className="mt-6 text-center text-sm text-[var(--color-text-muted)]">
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