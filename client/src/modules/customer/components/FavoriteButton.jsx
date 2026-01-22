import { Heart } from "lucide-react";

export default function FavoriteButton({ active, onToggle }) {
  return (
    <button
      onClick={(e) => {
        e.stopPropagation();
        onToggle();
      }}
      className="absolute top-2 left-2 bg-white p-1 rounded-full shadow"
    >
      <Heart
        size={16}
        className={active ? "fill-red-500 text-red-500" : "text-gray-400"}
      />
    </button>
  );
}
