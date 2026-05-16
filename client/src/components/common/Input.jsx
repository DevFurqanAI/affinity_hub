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
        <label htmlFor={id} className="block text-sm font-semibold text-slate-700">
          {label}
        </label>
      ) : null}

      <input
        id={id}
        type={type}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className={`w-full rounded-2xl border bg-white px-4 py-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:ring-2 ${
          error
            ? "border-red-300 focus:border-red-500 focus:ring-red-100"
            : "border-slate-300 focus:border-slate-900 focus:ring-slate-200"
        } ${className}`}
        {...props}
      />

      {error ? <p className="text-xs font-medium text-red-600">{error}</p> : null}

      {!error && helper ? <p className="text-xs text-slate-400">{helper}</p> : null}
    </div>
  );
}

export default Input;