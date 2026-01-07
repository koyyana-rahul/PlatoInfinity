// StaffPinLogin.jsx
import { useState } from "react";
import Axios from "../../../api/axios";
import staffApi from "../../../api/staff.api";
import { useNavigate } from "react-router-dom";

export default function StaffPinLogin() {
  const [restaurantId, setRestaurantId] = useState("");
  const [pin, setPin] = useState("");
  const navigate = useNavigate();

  const submit = async () => {
    const res = await Axios({
      ...staffApi.staffLogin,
      data: { restaurantId, staffPin: pin },
    });

    const role = res.data.data.user.role.toLowerCase();
    navigate(`/staff/${role}`);
  };

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="bg-white p-6 rounded-xl w-80 space-y-3">
        <h2 className="text-lg font-semibold">Staff Login</h2>

        <input
          placeholder="Restaurant ID"
          value={restaurantId}
          onChange={(e) => setRestaurantId(e.target.value)}
          className="input"
        />

        <input
          placeholder="4-digit PIN"
          value={pin}
          onChange={(e) => setPin(e.target.value)}
          className="input"
        />

        <button onClick={submit} className="btn-primary w-full">
          Login
        </button>
      </div>
    </div>
  );
}
