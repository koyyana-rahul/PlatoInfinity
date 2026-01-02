// src/modules/admin/managers/ManagersPage.jsx
import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import InviteManagerModal from "./InviteManagerModal";

export default function ManagersPage() {
  const { restaurantId } = useParams();
  const navigate = useNavigate();
  const [restaurant, setRestaurant] = useState(null);
  const [managers, setManagers] = useState([]);
  const [openInvite, setOpenInvite] = useState(false);

  useEffect(() => {
    async function load() {
      const r = await Axios(restaurantApi.getById(restaurantId));
      setRestaurant(r.data.data);

      const m = await Axios(restaurantApi.managers(restaurantId));
      setManagers(m.data.data);
    }
    load();
  }, [restaurantId]);

  return (
    <>
      <button onClick={() => navigate(-1)}>← Back</button>
      <h2>{restaurant?.name} – Managers</h2>

      <button onClick={() => setOpenInvite(true)}>Invite Manager</button>

      {managers.map((m) => (
        <div key={m._id}>
          {m.name} – {m.isActive ? "Active" : "Invited"}
        </div>
      ))}

      {openInvite && (
        <InviteManagerModal
          restaurantId={restaurantId}
          onClose={() => setOpenInvite(false)}
          onSuccess={() =>
            Axios(restaurantApi.managers(restaurantId)).then((r) =>
              setManagers(r.data.data)
            )
          }
        />
      )}
    </>
  );
}