function Input({
  label,
  id,
  type = "text",
  value,
  onChange,
  placeholder = "",
  error = "",
  helper = "",
  className = "",
  ...props
}) {
  return (
    <div className="space-y-2">
      {label ? (
        <label
          htmlFor={id}
          className="block text-[10px] font-black uppercase tracking-[0.2em] text-[var(--color-text-muted)]"
        >
          {label}
        </label>
      ) : null}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        aria-invalid={Boolean(error)}
        className={`ui-input w-full rounded-lg border bg-[var(--color-surface-muted)] px-4 py-3 text-sm text-[var(--color-text)] outline-none transition placeholder:text-[var(--color-text-muted)] focus:ring-0 ${
          error
            ? "border-[var(--color-danger)] focus:border-[var(--color-danger)]"
            : "border-[var(--color-border)] focus:border-[var(--color-primary)]"
        } ${className}`}
        {...props}
      />

      {error ? (
        <p className="text-xs font-semibold text-[var(--color-danger)]">
          {error}
        </p>
      ) : null}

      {!error && helper ? (
        <p className="text-xs text-[var(--color-text-muted)]">{helper}</p>
      ) : null}
    </div>
  );
}

export default Input;