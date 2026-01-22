export default function QuantityStepper({ value, onAdd, onMinus }) {
  if (!value) {
    return (
      <button
        onClick={onAdd}
        className="px-3 py-1.5 bg-emerald-600 text-white rounded-lg text-xs"
      >
        Add
      </button>
    );
  }

  return (
    <div className="flex items-center bg-emerald-600 text-white rounded-lg px-2">
      <button onClick={onMinus} className="text-lg px-2">−</button>
      <span className="font-semibold px-2">{value}</span>
      <button onClick={onAdd} className="text-lg px-2">+</button>
    </div>
  );
}
