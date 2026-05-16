function Loader({ text = "Loading..." }) {
  return (
    <div className="flex items-center justify-center gap-3 py-6">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900" />

      {text ? <p className="text-sm font-medium text-slate-500">{text}</p> : null}
    </div>
  );
}

export default Loader;