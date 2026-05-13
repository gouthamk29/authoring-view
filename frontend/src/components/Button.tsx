export function Button({ children }) {
  return (
    <button className="m-1 rounded-xl border border-green-900 bg-green-600/80 px-3 py-2 text-white/70 ring-green-600 active:ring-1">
      {children}
    </button>
  );
}
