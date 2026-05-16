function PageContainer({
  children,
  title,
  subtitle,
  actions,
  maxWidth = "max-w-4xl",
  className = ""
}) {
  return (
    <main className={`mx-auto w-full ${maxWidth} space-y-6 ${className}`}>
      {(title || subtitle || actions) && (
        <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {title ? (
                <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                  {title}
                </h1>
              ) : null}

              {subtitle ? (
                <p className="mt-1 text-sm leading-6 text-slate-500">
                  {subtitle}
                </p>
              ) : null}
            </div>

            {actions ? <div className="shrink-0">{actions}</div> : null}
          </div>
        </section>
      )}

      {children}
    </main>
  );
}

export default PageContainer;