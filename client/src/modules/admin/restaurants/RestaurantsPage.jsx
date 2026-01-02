// src/modules/admin/restaurants/RestaurantsPage.jsx
import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Axios from "../../../api/axios";
import restaurantApi from "../../../api/restaurant.api";
import RestaurantCard from "./RestaurantCard";
import CreateRestaurantModal from "./CreateRestaurantModal";

export default function RestaurantsPage() {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const [openCreate, setOpenCreate] = useState(false);

  const fetch = async () => {
    const res = await Axios(restaurantApi.list);
    setRestaurants(res.data.data);
  };

  useEffect(() => {
    fetch();
  }, []);

  return (
    <>
      <button onClick={() => setOpenCreate(true)}>+ Add Restaurant</button>

      {restaurants.map((r) => (
        <RestaurantCard
          key={r._id}
          data={r}
          onManageManagers={() =>
            navigate(`/${brandSlug}/admin/restaurants/${r._id}/managers`)
          }
        />
      ))}

      {openCreate && (
        <CreateRestaurantModal
          onClose={() => setOpenCreate(false)}
          onSuccess={fetch}
        />
      )}
    </>
  );
}
