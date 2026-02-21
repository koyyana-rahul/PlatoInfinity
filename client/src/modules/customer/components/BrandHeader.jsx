import { useSelector } from "react-redux";
import { Link } from "react-router-dom";

const BrandHeader = () => {
  const brand = useSelector((s) => s.brand);

  if (!brand?._id) {
    // Skeleton loader for when brand is not yet loaded
    return (
      <div className="flex items-center gap-3 p-4 animate-pulse">
        <div className="h-12 w-12 rounded-full bg-gray-200 dark:bg-gray-700" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-3/5 rounded bg-gray-200 dark:bg-gray-700" />
          <div className="h-3 w-2/5 rounded bg-gray-200 dark:bg-gray-700" />
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-4 p-4">
      <Link to="/" className="flex items-center gap-4">
        {brand.logoUrl ? (
          <div className="h-12 w-12 rounded-full overflow-hidden shadow-sm">
            <img
              src={brand.logoUrl}
              alt={brand.name}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="h-12 w-12 rounded-full bg-saffron text-white flex items-center justify-center font-extrabold text-xl">
            {brand.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-xl font-bold text-deep-green dark:text-cream">
            {brand.name}
          </h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Welcome to our table!
          </p>
        </div>
      </Link>
    </div>
  );
};

export default BrandHeader;
