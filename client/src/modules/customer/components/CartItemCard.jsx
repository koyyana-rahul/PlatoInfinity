import { Minus, Plus, Trash2 } from "lucide-react";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

const CartItemCard = ({ item, onAdd, onMinus, onRemove }) => {
  const stationIcon = (station) => {
    if (!station) return "🍽️";
    const s = station.toLowerCase();
    if (s.includes("bar")) return "🍹";
    if (s.includes("tandoor")) return "🔥";
    if (s.includes("pizza")) return "🍕";
    return "🍽️";
  };

  return (
    <div className="flex items-center gap-4 bg-white border border-gray-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition">
      {item.image && (
        <img
          src={item.image}
          alt={item.name}
          className="w-20 h-20 md:w-24 md:h-24 object-cover rounded-xl"
        />
      )}
      <div className="flex-grow">
        <div className="flex justify-between items-start">
          <h3 className="font-bold text-base md:text-lg text-gray-900">
            {item.name}
          </h3>
          <VegNonVegIcon isVeg={item.isVeg} />
        </div>

        {item.station && (
          <p className="text-xs text-gray-500 mt-1">
            {stationIcon(item.station)} {item.station}
          </p>
        )}

        <div className="flex items-center justify-between mt-3">
          <p className="text-lg font-bold text-gray-900">
            ₹{item.price * item.quantity}
          </p>
          <div className="flex items-center gap-2 bg-orange-500 text-white rounded-full h-9 md:h-10 px-3 shadow-lg">
            <button
              onClick={() => onMinus(item)}
              className="p-1 hover:scale-110 transition"
              aria-label="Decrease quantity"
            >
              <Minus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
            <span className="font-bold text-base md:text-lg w-6 text-center">
              {item.quantity}
            </span>
            <button
              onClick={() => onAdd(item)}
              className="p-1 hover:scale-110 transition"
              aria-label="Increase quantity"
            >
              <Plus className="w-4 h-4 md:w-5 md:h-5" />
            </button>
          </div>
        </div>
      </div>
      <button
        onClick={() => onRemove(item)}
        className="text-gray-400 hover:text-red-500 transition-colors self-start"
        aria-label="Remove item"
      >
        <Trash2 className="w-4 h-4" />
      </button>
    </div>
  );
};

export default CartItemCard;
