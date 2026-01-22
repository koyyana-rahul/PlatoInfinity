import Modal from "../ui/Modal";

export default function SessionInfoModal({ info, onClose }) {
  if (!info) return null;

  return (
    <Modal title="Customer PIN" onClose={onClose}>
      <div className="text-center space-y-4">
        <div className="text-5xl font-extrabold tracking-widest text-emerald-600">
          {info.tablePin}
        </div>

        <p className="text-sm text-gray-600">
          Ask customer to enter this PIN on their phone.
        </p>
      </div>
    </Modal>
  );
}
