export default function LoadingSkeleton({ type = 'card', count = 3 }) {
  if (type === 'page') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (type === 'table') {
    return (
      <div className="space-y-3">
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="h-14 bg-slate-200 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (type === 'chart') {
    return <div className="h-64 bg-slate-200 rounded-xl animate-pulse" />;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="h-28 bg-slate-200 rounded-xl animate-pulse" />
      ))}
    </div>
  );
}
