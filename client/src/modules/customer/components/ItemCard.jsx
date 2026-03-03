import { useNavigate, useParams } from "react-router-dom";
import QuantityStepper from "./QuantityStepper";
// import FavoriteButton from "./FavoriteButton";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";
import {
  fallbackCustomerImage,
  getPrimaryItemImage,
} from "../utils/resolveItemImages";

export default function ItemCard({ item, qty = 0, onAdd, onMinus }) {
  const navigate = useNavigate();
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const itemId = item?.id || item?._id;

  const goToItem = () => {
    navigate(`/${brandSlug}/${restaurantSlug}/table/${tableId}/item/${itemId}`);
  };

  return (
    <div
      onClick={goToItem}
      className="group bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden relative cursor-pointer transition-all duration-300 hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]"
    >
      {/* IMAGE */}
      <div className="relative p-3 pb-0">
        <div className="relative overflow-hidden rounded-2xl bg-gray-100">
          <img
            src={getPrimaryItemImage(item)}
            alt={item.name}
            loading="lazy"
            onError={fallbackCustomerImage}
            className="h-40 sm:h-44 md:h-48 w-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        </div>

        {/* VEG / NON-VEG */}
        <div className="absolute top-5 left-5">
          <div className="bg-white/90 backdrop-blur-md px-2 py-1 rounded-lg shadow-sm border border-gray-100">
            <VegNonVegIcon isVeg={item.isVeg} size={10} />
          </div>
        </div>

        {/* STEPPER (ONLY IF IN CART) */}
        {qty > 0 && (
          <div className="absolute bottom-4 right-5">
            <QuantityStepper
              value={qty}
              onAdd={(e) => {
                e.stopPropagation();
                onAdd(itemId);
              }}
              onMinus={(e) => {
                e.stopPropagation();
                onMinus(itemId);
              }}
            />
          </div>
        )}
      </div>

      {/* CONTENT */}
      <div className="px-4 pb-4 pt-3 space-y-2">
        {/* NAME */}
        <p className="font-bold tracking-tight text-[15px] sm:text-base leading-tight line-clamp-2 text-gray-900">
          {item.name}
        </p>

        {/* PRICE */}
        <div className="pt-2 flex justify-between items-center">
          <span className="text-lg font-bold text-gray-900">₹{item.price}</span>
          {qty === 0 && (
            <span className="text-xs font-semibold text-orange-600 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-200">
              Add
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
