import { motion } from "framer-motion";
import { Plus, Minus, Star, Flame } from "lucide-react";
import VegNonVegIcon from "../../../components/ui/VegNonVegIcon";
import {
  fallbackCustomerImage,
  getPrimaryItemImage,
} from "../utils/resolveItemImages";

const FoodCard = ({ item, quantity, onAdd, onMinus }) => {
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 },
  };

  const imageSrc = getPrimaryItemImage(item);
  const hasImage = !!imageSrc;

  return (
    <motion.div
      variants={cardVariants}
      className="bg-white dark:bg-dark-surface rounded-2xl shadow-subtle dark:shadow-subtle-dark overflow-hidden flex flex-col"
    >
      {/* Image Section */}
      {hasImage && (
        <div className="w-full h-40 overflow-hidden">
          <img
            src={imageSrc}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
            onError={fallbackCustomerImage}
          />
        </div>
      )}

      {/* Content Section */}
      <div className="p-4 flex flex-col flex-grow">
        <div className="flex justify-between items-start mb-2">
          <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 leading-tight">
            {item.name}
          </h3>
          <VegNonVegIcon isVeg={item.isVeg} />
        </div>

        {/* Spice & Rating */}
        <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-300 mb-4">
          {item.spiceLevel && (
            <div className="flex items-center gap-1">
              <Flame className="w-4 h-4 text-orange-500" />
              <span>{item.spiceLevel}</span>
            </div>
          )}
          {item.rating && (
            <div className="flex items-center gap-1">
              <Star className="w-4 h-4 text-yellow-500" />
              <span>{item.rating.toFixed(1)}</span>
            </div>
          )}
        </div>

        {/* Price & Add Button */}
        <div className="flex justify-between items-center mt-auto">
          <p className="text-lg font-extrabold text-deep-green dark:text-cream">
            ₹{item.price}
          </p>

          {quantity > 0 ? (
            <div className="flex items-center gap-2 bg-saffron text-white rounded-full h-10 px-3 shadow-lg">
              <button
                onClick={() => onMinus(item.id)}
                className="tap-scaling p-1"
                aria-label="Decrease quantity"
              >
                <Minus className="w-5 h-5" />
              </button>
              <span className="font-bold text-lg">{quantity}</span>
              <button
                onClick={() => onAdd(item.id)}
                className="tap-scaling p-1"
                aria-label="Increase quantity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onAdd(item.id)}
              className="bg-saffron-light text-deep-green font-bold rounded-full h-10 px-6 tap-scaling shadow-md hover:shadow-lg transition-shadow"
              aria-label="Add to cart"
            >
              Add
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default FoodCard;
