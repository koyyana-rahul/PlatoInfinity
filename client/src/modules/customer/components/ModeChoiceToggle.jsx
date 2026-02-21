import clsx from "clsx";
import { Users, User } from "lucide-react";

const ModeChoiceToggle = ({ mode, onModeChange }) => {
  return (
    <div className="bg-white dark:bg-dark-surface rounded-2xl p-4 shadow-subtle dark:shadow-subtle-dark">
      <h3 className="text-base font-bold mb-4 text-gray-800 dark:text-gray-100">
        Order As
      </h3>
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => onModeChange("FAMILY")}
          className={clsx(
            "p-4 rounded-xl border-2 transition-all text-center tap-scaling",
            mode === "FAMILY"
              ? "border-deep-green bg-deep-green/10 dark:bg-deep-green/30 text-deep-green dark:text-cream"
              : "border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300 dark:hover:border-gray-600"
          )}
        >
          <Users className="mx-auto mb-2 w-6 h-6" />
          <p className="font-bold text-sm">Shared</p>
          <p className="text-xs opacity-70 font-normal">For the table</p>
        </button>
        <button
          onClick={() => onModeChange("INDIVIDUAL")}
          className={clsx(
            "p-4 rounded-xl border-2 transition-all text-center tap-scaling",
            mode === "INDIVIDUAL"
              ? "border-deep-green bg-deep-green/10 dark:bg-deep-green/30 text-deep-green dark:text-cream"
              : "border-gray-200 dark:border-gray-700 bg-transparent hover:border-gray-300 dark:hover:border-gray-600"
          )}
        >
          <User className="mx-auto mb-2 w-6 h-6" />
          <p className="font-bold text-sm">Individual</p>
          <p className="text-xs opacity-70 font-normal">Pay separately</p>
        </button>
      </div>
    </div>
  );
};

export default ModeChoiceToggle;
