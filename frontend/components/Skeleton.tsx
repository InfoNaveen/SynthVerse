export function DataSkeleton() {
  return (
    <div className="animate-pulse space-y-3">
      {[...Array(5)].map((_, i) => (
        <div key={i} className="flex justify-between items-center">
          <div className="h-3 bg-[#1e293b] rounded w-24"/>
          <div className="h-3 bg-[#1e293b] rounded w-16"/>
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="h-4 bg-[#1e293b] rounded w-3/4 mb-4"/>
      <div className="h-20 bg-[#1e293b] rounded mb-3"/>
      <div className="h-4 bg-[#1e293b] rounded w-1/2"/>
    </div>
  );
}
