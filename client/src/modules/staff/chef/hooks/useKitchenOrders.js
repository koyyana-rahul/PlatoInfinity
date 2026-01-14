// src/modules/staff/chef/hooks/useKitchenOrders.js
import { useEffect, useState } from "react";
import Axios from "../../../../api/axios";
import chefApi from "../../../../api/chef.api";
import toast from "react-hot-toast";

export default function useKitchenOrders(station) {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      setLoading(true);
      const res = await Axios({
        ...chefApi.listOrders,
        params: { station },
      });
      setOrders(res.data.data || []);
    } catch {
      toast.error("Failed to load kitchen orders");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (station) loadOrders();
  }, [station]);

  return { orders, loading, reload: loadOrders };
}
