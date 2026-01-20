import { Link } from "react-router-dom";

export default function PlaceholderPage({
  title = "Coming soon",
  description = "This page is under construction.",
  backTo = null,
  backLabel = "Go back",
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border rounded-2xl shadow-sm p-6 sm:p-8">
        <h1 className="text-xl sm:text-2xl font-semibold text-gray-900">
          {title}
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">
          {description}
        </p>

        {backTo && (
          <div className="mt-6">
            <Link
              to={backTo}
              className="inline-flex items-center justify-center px-4 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            >
              {backLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
