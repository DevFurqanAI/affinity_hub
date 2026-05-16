function Card({ children, className = "", padding = "p-5 sm:p-6" }) {
  return (
    <section
      className={`rounded-3xl border border-slate-200 bg-white ${padding} shadow-sm ${className}`}
    >
      {children}
    </section>
  );
}

export default Card;