export default function Modal({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center px-3">
      <div className="bg-white w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="font-bold text-sm">{title}</h3>
          <button onClick={onClose}>✕</button>
        </div>

        <div className="p-4 overflow-y-auto">{children}</div>
      </div>
    </div>
  );
}
