export default function DashboardLoading() {
  return (
    <div className="p-6 space-y-6 animate-pulse">
      <div className="h-8 w-48 bg-gray-200 dark:bg-gray-700 rounded-md"></div>
      
      {/* Cards Skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
        ))}
      </div>

      {/* Main Content Skeleton */}
      <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-xl"></div>
    </div>
  );
}