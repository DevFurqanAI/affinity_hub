function Button({
  children,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  className = "",
  onClick,
  ...props
}) {
  const baseClasses =
    "inline-flex items-center justify-center rounded-lg font-extrabold transition-all duration-200 active:scale-[0.98] focus:outline-none focus:ring-2 focus:ring-[var(--color-focus)] focus:ring-offset-2 focus:ring-offset-[var(--color-surface)] disabled:cursor-not-allowed disabled:opacity-60 disabled:active:scale-100";

  const variantClasses = {
    primary:
      "border border-[var(--color-follow)] bg-[var(--color-follow)] text-white shadow-sm hover:bg-[var(--color-follow-hover)] hover:border-[var(--color-follow-hover)]",
    secondary:
      "border border-[var(--color-border)] bg-[var(--color-surface-muted)] text-[var(--color-text)] hover:bg-[var(--color-primary-soft)] hover:text-[var(--color-primary)]",
    outline:
      "border border-[var(--color-border)] bg-[var(--color-surface)] text-[var(--color-text)] hover:bg-[var(--color-surface-muted)]",
    danger:
      "border border-[var(--color-danger)] bg-[var(--color-danger)] text-white hover:brightness-95",
    ghost:
      "border border-transparent bg-transparent text-[var(--color-text-muted)] hover:bg-[var(--color-surface-muted)] hover:text-[var(--color-text)]"
  };

  const sizeClasses = {
    sm: "px-3 py-2 text-[11px]",
    md: "px-4 py-2.5 text-xs",
    lg: "px-5 py-3 text-sm"
  };

  return (
    <button
      type={type}
      disabled={disabled}
      onClick={onClick}
      className={`${baseClasses} ${
        variantClasses[variant] || variantClasses.primary
      } ${sizeClasses[size] || sizeClasses.md} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export default Button;