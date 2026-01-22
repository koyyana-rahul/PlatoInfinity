import ItemCard from "./ItemCard";

export default function ItemGrid({
  items = [],
  quantities = {},
  onAdd,
  onMinus,
}) {
  if (!items.length) {
    return (
      <div className="bg-white border rounded-xl p-6 text-gray-500">
        No items available
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4 px-4">
      {items.map((item) => (
        <ItemCard
          key={item.id}
          item={item}
          qty={quantities[item.id] ?? 0}
          onAdd={onAdd}
          onMinus={onMinus}
        />
      ))}
    </div>
  );
}
