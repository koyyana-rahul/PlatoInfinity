import { useEffect, useMemo, useState } from "react";
import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";
import { useCustomerSocket } from "./useCustomerSocket";

export default function useCustomerCart(sessionId) {
  const [cart, setCart] = useState(null);

  const load = async () => {
    const res = await Axios(customerApi.cart.get);
    setCart(res.data.data);
  };

  useEffect(() => {
    load();
  }, []);

  useCustomerSocket({
    sessionId,
    onCartUpdate: setCart,
  });

  const add = async (id) => {
    await Axios({
      ...customerApi.cart.add,
      data: { branchMenuItemId: id, quantity: 1 },
    });
  };

  const update = async (cartItemId, qty) => {
    await Axios({
      ...customerApi.cart.update,
      data: { cartItemId, quantity: qty },
    });
  };

  const remove = async (cartItemId) => {
    await Axios(customerApi.cart.remove(cartItemId));
  };

  /** 🔥 map: branchMenuItemId → quantity */
  const quantities = useMemo(() => {
    const map = {};
    cart?.items?.forEach((i) => {
      map[i.branchMenuItemId] = i.quantity;
    });
    return map;
  }, [cart]);

  return {
    cart,
    quantities,
    totalQty: cart?.items?.reduce((a, b) => a + b.quantity, 0) || 0,
    totalAmount: cart?.totalAmount || 0,
    add,
    update,
    remove,
  };
}
