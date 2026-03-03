import { Link } from "react-router-dom";
import { Sparkles } from "lucide-react";

export default function PlaceholderPage({
  title = "Coming soon",
  description = "This page is under construction.",
  backTo = null,
  backLabel = "Go back",
}) {
  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-xl bg-white border border-gray-200 rounded-2xl shadow-sm p-6 sm:p-8">
        <div className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wide text-orange-700 bg-orange-50 border border-orange-200 rounded-full px-2.5 py-1 mb-3">
          <Sparkles size={12} /> Product Update
        </div>

        <h1 className="text-xl sm:text-2xl font-bold text-gray-900">{title}</h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600">{description}</p>

        {backTo && (
          <div className="mt-6">
            <Link
              to={backTo}
              className="inline-flex items-center justify-center px-4 h-10 rounded-xl text-sm font-semibold bg-orange-500 text-white hover:bg-orange-600"
            >
              {backLabel}
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
