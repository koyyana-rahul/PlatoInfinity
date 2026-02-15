import { useNavigate, useParams } from "react-router-dom";
import QuantityStepper from "./QuantityStepper";
// import FavoriteButton from "./FavoriteButton";
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
        group bg-white rounded-3xl startup-shadow
        overflow-hidden relative cursor-pointer
        transition-all duration-300 will-change-transform
        hover:scale-[1.02]
        active:scale-[0.99]
      "
    >
      {/* IMAGE */}
      <div className="relative">
        <img
          src={item.image || "/food-placeholder.jpg"}
          alt={item.name}
          loading="lazy"
          className="h-44 w-full object-cover bg-gray-100"
        />

        {/* SOFT GRADIENT */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/35 via-black/10 to-transparent" />

        {/* PRICE TAG */}
        <div className="absolute bottom-4 right-4 bg-white/60 backdrop-blur-md text-slate-900 text-sm font-bold px-4 py-2 rounded-full startup-shadow">
          ₹{item.price}
        </div>

        {/* FAVORITE */}
        {/* <FavoriteButton
          onToggle={(e) => e.stopPropagation()}
          className="absolute top-2 left-2"
        /> */}

        {/* VEG / NON-VEG */}
        <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-md px-2 py-1 rounded-xl startup-shadow">
          <VegNonVegIcon isVeg={item.isVeg} size={10} />
        </div>

        {/* QTY BADGE (ONLY INDICATOR) */}
        {qty > 0 && (
          <div className="absolute top-3 right-3 bg-[#F35C2B] text-white text-xs px-2.5 py-1 rounded-full font-semibold startup-shadow">
            {qty}
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="p-5 space-y-4">
        {/* NAME */}
        <p className="font-bold tracking-tight text-base leading-tight line-clamp-2 text-slate-900">
          {item.name}
        </p>

        {/* DESCRIPTION */}
        {item.description && (
          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}

        {/* PRICE + STEPPER (ONLY IF IN CART) */}
        <div className="flex justify-end items-center pt-1">

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
