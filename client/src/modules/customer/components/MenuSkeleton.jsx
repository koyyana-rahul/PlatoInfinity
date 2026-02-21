const SkeletonCard = () => (
  <div className="bg-white dark:bg-dark-surface rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden">
    {/* Image Skeleton */}
    <div className="w-full h-40 bg-gray-200 dark:bg-gray-700 animate-skeleton"></div>
    {/* Content Skeleton */}
    <div className="p-4">
      <div className="h-6 w-3/4 mb-2 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded"></div>
      <div className="h-4 w-full mb-4 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded"></div>
      <div className="h-4 w-1/2 mb-4 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded"></div>
      <div className="flex justify-between items-center mt-4">
        <div className="h-8 w-1/3 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded"></div>
        <div className="h-10 w-1/3 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded-full"></div>
      </div>
    </div>
  </div>
);

const MenuSkeleton = () => {
  return (
    <div className="p-4">
      {/* Header Skeleton */}
      <div className="flex justify-between items-center mb-6">
        <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded"></div>
        <div className="h-10 w-48 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded-full"></div>
      </div>
      {/* Category Tabs Skeleton */}
      <div className="flex space-x-4 mb-6">
        <div className="h-10 w-24 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded-full"></div>
        <div className="h-10 w-32 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded-full"></div>
        <div className="h-10 w-28 bg-gray-200 dark:bg-gray-700 animate-skeleton rounded-full"></div>
      </div>
      {/* Grid Skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
        {[...Array(8)].map((_, i) => (
          <SkeletonCard key={i} />
        ))}
      </div>
    </div>
  );
};

export default MenuSkeleton;
