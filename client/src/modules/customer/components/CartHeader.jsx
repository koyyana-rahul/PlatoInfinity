import { ChevronLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const CartHeader = ({ title }) => {
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-30 bg-cream/80 dark:bg-dark-bg/80 backdrop-blur-lg p-4">
      <div className="relative flex items-center justify-center">
        <button
          onClick={() => navigate(-1)}
          className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-dark-surface shadow-sm tap-scaling"
        >
          <ChevronLeft size={24} />
        </button>
        <h1 className="text-lg font-bold text-deep-green dark:text-cream">
          {title}
        </h1>
      </div>
    </header>
  );
};

export default CartHeader;
