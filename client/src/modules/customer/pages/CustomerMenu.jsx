import { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";

import Axios from "../../../api/axios";
import customerApi from "../../../api/customer.api";

import CategoryBar from "../components/CategoryBar";
import SubcategoryFilter from "../components/SubcategoryFilter";
import ItemGrid from "../components/ItemGrid";
import StickyCartBar from "../components/StickyCartBar";

import {
  fetchCart,
  addToCart,
  updateCartItem,
  removeCartItem,
} from "../../../store/customer/cartThunks";

import {
  selectCartItems,
  selectQuantities,
} from "../../../store/customer/cartSelectors";

export default function CustomerMenu() {
  const { tableId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  /* ================= SESSION ================= */
  const sessionKey = `plato:customerSession:${tableId}`;
  const sessionId = localStorage.getItem(sessionKey);

  /* ================= MENU STATE ================= */
  const [menu, setMenu] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeCat, setActiveCat] = useState(null);
  const [activeSub, setActiveSub] = useState(null);

  /* ================= CART (REDUX) ================= */
  const cartItems = useSelector(selectCartItems);
  const quantities = useSelector(selectQuantities);

  /* ================= GUARD ================= */
  useEffect(() => {
    if (!sessionId) {
      toast.error("Please join the table first");
      navigate(`../`, { replace: true });
    }
  }, [sessionId, navigate]);

  /* ================= LOAD MENU ================= */
  useEffect(() => {
    if (!tableId || tableId.length !== 24) {
      toast.error("Invalid table QR");
      return;
    }

    let active = true;

    (async () => {
      try {
        setLoading(true);
        const res = await Axios(customerApi.publicMenuByTable(tableId));
        const data = res.data?.data || [];

        if (!active) return;

        setMenu(data);
        if (data.length) {
          setActiveCat(data[0].id);
          setActiveSub(null);
        }
      } catch {
        toast.error("Failed to load menu");
      } finally {
        if (active) setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [tableId]);

  /* ================= LOAD CART (ONLY WITH SESSION) ================= */
  useEffect(() => {
    if (!sessionId) return;
    dispatch(fetchCart());
  }, [dispatch, sessionId]);

  /* ================= DERIVED DATA ================= */
  const category = useMemo(
    () => menu.find((c) => c.id === activeCat),
    [menu, activeCat],
  );

  const items = useMemo(() => {
    if (!category) return [];
    if (!activeSub) {
      return category.subcategories.flatMap((s) => s.items);
    }
    return category.subcategories.find((s) => s.id === activeSub)?.items || [];
  }, [category, activeSub]);

  /* ================= CART ACTIONS ================= */
  const onAdd = (branchMenuItemId) => {
    dispatch(addToCart({ branchMenuItemId, quantity: 1 }));
  };

  const onMinus = (branchMenuItemId) => {
    const cartItem = cartItems.find(
      (i) => i.branchMenuItemId === branchMenuItemId,
    );
    if (!cartItem) return;

    if (cartItem.quantity <= 1) {
      dispatch(removeCartItem(cartItem._id));
    } else {
      dispatch(
        updateCartItem({
          cartItemId: cartItem._id,
          quantity: cartItem.quantity - 1,
        }),
      );
    }
  };

  /* ================= UI ================= */
  if (loading) {
    return (
      <div className="p-6">
        <div className="h-32 bg-gray-200 animate-pulse rounded-xl" />
      </div>
    );
  }

  return (
    <div className="pb-28">
      {/* CATEGORY */}
      <CategoryBar
        categories={menu}
        activeId={activeCat}
        onSelect={(id) => {
          setActiveCat(id);
          setActiveSub(null);
        }}
      />

      {/* SUBCATEGORY */}
      <SubcategoryFilter
        subcategories={category?.subcategories || []}
        activeId={activeSub}
        onSelect={setActiveSub}
      />

      {/* ITEMS */}
      <ItemGrid
        items={items}
        quantities={quantities}
        onAdd={onAdd}
        onMinus={onMinus}
      />

      {/* STICKY CART */}
      <StickyCartBar />
    </div>
  );
}
