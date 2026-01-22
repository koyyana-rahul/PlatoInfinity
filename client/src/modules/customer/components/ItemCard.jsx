import { useNavigate, useParams } from "react-router-dom";
import QuantityStepper from "./QuantityStepper";
import FavoriteButton from "./FavoriteButton";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";

export default function ItemCard({ item, qty = 0, onAdd, onMinus }) {
  const navigate = useNavigate();
  const { brandSlug, restaurantSlug, tableId } = useParams();

  const goToItem = () => {
    navigate(
      `/${brandSlug}/${restaurantSlug}/table/${tableId}/item/${item.id}`,
    );
  };

  return (
    <div
      onClick={goToItem}
      className="
        group bg-white rounded-2xl border border-gray-100
        overflow-hidden relative cursor-pointer
        transition-all duration-200
        hover:shadow-lg hover:-translate-y-0.5
        active:scale-[0.98]
      "
    >
      {/* IMAGE */}
      <div className="relative">
        <img
          src={item.image || "/food-placeholder.jpg"}
          alt={item.name}
          loading="lazy"
          className="h-40 w-full object-cover bg-gray-100"
        />

        {/* SOFT GRADIENT */}
        <div className="absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t from-black/40 to-transparent" />

        {/* FAVORITE */}
        <FavoriteButton
          onToggle={(e) => e.stopPropagation()}
          className="absolute top-2 left-2"
        />

        {/* VEG / NON-VEG */}
        <div className="absolute top-2 right-2 bg-white/90 backdrop-blur px-1.5 py-1 rounded-md shadow-sm">
          <VegNonVegIcon isVeg={item.isVeg} size={10} />
        </div>

        {/* QTY BADGE (ONLY INDICATOR) */}
        {qty > 0 && (
          <div className="absolute bottom-2 right-2 bg-emerald-600 text-white text-xs px-2 py-0.5 rounded-full font-semibold shadow-md">
            {qty}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-3 space-y-2">
        {/* NAME */}
        <p className="font-semibold text-sm leading-tight line-clamp-2">
          {item.name}
        </p>

        {/* DESCRIPTION */}
        {item.description && (
          <p className="text-xs text-gray-500 line-clamp-2">
            {item.description}
          </p>
        )}

        {/* PRICE + STEPPER (ONLY IF IN CART) */}
        <div className="flex justify-between items-center pt-1">
          <span className="font-semibold text-sm text-gray-900">
            ₹{item.price}
          </span>

          {qty > 0 && (
            <QuantityStepper
              value={qty}
              onAdd={(e) => {
                e.stopPropagation();
                onAdd(item.id);
              }}
              onMinus={(e) => {
                e.stopPropagation();
                onMinus(item.id);
              }}
            />
          )}
        </div>
      </div>
    </div>
  );
}
