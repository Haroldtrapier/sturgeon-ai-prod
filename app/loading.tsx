export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-400" />
        <p className="text-sm text-slate-400">Loading...</p>
      </div>
    </div>
  );
}
