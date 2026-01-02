// src/modules/admin/managers/InviteManagerModal.jsx
import { useState } from "react";
import toast from "react-hot-toast";
import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";

export default function InviteManagerModal({
  restaurantId,
  onClose,
  onSuccess,
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    if (!name.trim() || !email.trim()) {
      toast.error("Name and email are required");
      return;
    }

    try {
      setLoading(true);

      await Axios({
        ...res.inviteManager(restaurantId),
        data: { name, email },
      });

      toast.success("Invite sent successfully");
      onSuccess?.();
      onClose();
    } catch (err) {
      toast.error(err?.response?.data?.message || "Failed to invite manager");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
      <div className="bg-white w-full max-w-md rounded-xl shadow-lg p-6 space-y-4">
        <h2 className="text-lg font-bold">Invite Manager</h2>

        <input
          className="input"
          placeholder="Manager name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <input
          className="input"
          placeholder="Manager email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <div className="flex justify-end gap-3 pt-4">
          <button onClick={onClose} className="px-4 py-2 rounded-lg border">
            Cancel
          </button>
          <button onClick={submit} disabled={loading} className="btn-primary">
            {loading ? "Sending..." : "Send Invite"}
          </button>
        </div>
      </div>
    </div>
  );
}
