function PageContainer({
  children,
  title,
  subtitle,
  actions,
  maxWidth = "max-w-4xl",
  className = ""
}) {
  return (
    <main className={`mx-auto w-full ${maxWidth} space-y-5 ${className}`}>
      {title || subtitle || actions ? (
        <header className="flex flex-col gap-4 border-b border-[var(--color-border)] pb-5 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            {title ? (
              <h1 className="text-xl font-black tracking-tight text-[var(--color-text)] sm:text-2xl">
                {title}
              </h1>
            ) : null}

            {subtitle ? (
              <p className="mt-1.5 max-w-2xl text-sm leading-6 text-[var(--color-text-muted)]">
                {subtitle}
              </p>
            ) : null}
          </div>

          {actions ? <div className="shrink-0">{actions}</div> : null}
        </header>
      ) : null}

      {children}
    </main>
  );
}

export default PageContainer;