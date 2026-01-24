// src/modules/staff/cashier/hooks/useCashierBills.js
import { useEffect, useState, useCallback } from "react";
import { useSocket } from "../../../../socket/SocketProvider";
import axios from "../../../../api/axios";
import cashierApi from "../../../../api/cashier.api";
import toast from "react-hot-toast";

export function useCashierBills() {
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(false);
  const socket = useSocket();

  // LOAD PENDING BILLS
  const loadPendingBills = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios(cashierApi.getPendingBills);
      if (res.data.success) {
        setBills(res.data.data || []);
      }
    } catch (err) {
      console.error("Failed to load bills:", err);
      toast.error("Failed to load bills");
    } finally {
      setLoading(false);
    }
  }, []);

  // LOAD CASHIER SUMMARY
  const loadSummary = useCallback(async () => {
    try {
      const res = await axios(cashierApi.getSummary);
      if (res.data.success) {
        setSummary(res.data.data);
      }
    } catch (err) {
      console.error("Failed to load summary:", err);
    }
  }, []);

  // PROCESS PAYMENT
  const processPayment = useCallback(
    async (billId, paymentMethod = "CASH", amountPaid = 0, notes = "") => {
      try {
        const res = await axios(cashierApi.processBillPayment(billId), {
          paymentMethod,
          amountPaid,
          notes,
        });
        if (res.data.success) {
          toast.success("Payment processed!");
          loadPendingBills();
          loadSummary();
          return res.data.data;
        }
      } catch (err) {
        console.error("Failed to process payment:", err);
        toast.error(err.response?.data?.message || "Failed to process payment");
        throw err;
      }
    },
    [loadPendingBills, loadSummary],
  );

  // SPLIT PAYMENT
  const splitPayment = useCallback(
    async (billId, payments) => {
      try {
        const res = await axios(cashierApi.splitBillPayment(billId), {
          payments,
        });
        if (res.data.success) {
          toast.success("Split payment processed!");
          loadPendingBills();
          loadSummary();
          return res.data.data;
        }
      } catch (err) {
        console.error("Failed to split payment:", err);
        toast.error(err.response?.data?.message || "Failed to split payment");
        throw err;
      }
    },
    [loadPendingBills, loadSummary],
  );

  // GET BILL DETAILS
  const getBillDetail = useCallback(async (billId) => {
    try {
      const res = await axios(cashierApi.getBillDetail(billId));
      if (res.data.success) {
        return res.data.data;
      }
    } catch (err) {
      console.error("Failed to get bill details:", err);
      toast.error("Failed to load bill");
      throw err;
    }
  }, []);

  // LOAD ON MOUNT
  useEffect(() => {
    loadPendingBills();
    loadSummary();
  }, [loadPendingBills, loadSummary]);

  // REAL-TIME SOCKET UPDATES
  useEffect(() => {
    if (!socket) return;

    // When a bill is settled
    const handleBillSettled = ({ billId }) => {
      setBills((prev) => prev.filter((bill) => bill._id !== billId));
      loadSummary();
      toast.success("Bill settled!");
    };

    // When new bill is generated
    const handleNewBill = (bill) => {
      setBills((prev) => [bill, ...prev]);
    };

    socket.on("cashier:bill-settled", handleBillSettled);
    socket.on("bill:generated", handleNewBill);

    return () => {
      socket.off("cashier:bill-settled", handleBillSettled);
      socket.off("bill:generated", handleNewBill);
    };
  }, [socket, loadSummary]);

  return {
    bills,
    summary,
    loading,
    loadPendingBills,
    loadSummary,
    processPayment,
    splitPayment,
    getBillDetail,
  };
}
