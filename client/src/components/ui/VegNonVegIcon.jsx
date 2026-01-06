export default function VegNonVegIcon({ isVeg, size = 10, className = "" }) {
  return (
    <span
      className={`inline-flex items-center justify-center border rounded-sm ${className} ${
        isVeg ? "border-green-600" : "border-red-600"
      }`}
      style={{ width: size + 6, height: size + 6 }}
      title={isVeg ? "Vegetarian" : "Non-Vegetarian"}
    >
      <span
        className={`${
          isVeg ? "bg-green-600 rounded-full" : "bg-red-600 rotate-45"
        }`}
        style={{ width: size, height: size }}
      />
    </span>
  );
}
