function Card({
  children,
  className = "",
  padding = "p-5 sm:p-6",
  as: Component = "section"
}) {
  return (
    <Component
      className={`ui-card overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface)] ${padding} ${className}`}
    >
      {children}
    </Component>
  );
}

export default Card;