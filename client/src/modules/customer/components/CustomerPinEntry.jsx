/**
 * CustomerPinEntry.jsx
 *
 * Complete PIN entry component with:
 * - Rate-limited PIN attempts
 * - Session recovery
 * - Error handling
 * - Loading states
 */

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import useCustomerSession from "../../hooks/useCustomerSession";
import Axios from "../../api/axios";
import customerApi from "../../api/customer.api";

export default function CustomerPinEntry() {
  const navigate = useNavigate();
  const { brandSlug, restaurantSlug, tableId } = useParams();
  const { restaurantId } = useParams(); // Added from context

  const {
    session,
    isAuthenticated,
    tokenExpired,
    pinError,
    loading,
    verifyPin,
    resumeSession,
    loadSessionFromStorage,
  } = useCustomerSession(tableId, restaurantId);

  const [pin, setPin] = useState("");
  const [tableName, setTableName] = useState("");
  const [showRecovery, setShowRecovery] = useState(false);
  const [table, setTable] = useState(null);

  /* ========== LOAD TABLE INFO ========== */
  useEffect(() => {
    (async () => {
      try {
        // First, try to load existing session
        const hasSession = await loadSessionFromStorage();
        if (hasSession && !tokenExpired) {
          // Session exists and is valid - redirect to menu
          navigate("menu");
          return;
        }

        // Load table info for PIN entry
        if (tableId) {
          const res = await Axios(customerApi.publicTable(tableId));
          setTable(res.data?.data);
          setTableName(res.data?.data?.tableNumber || "Your Table");
        }
      } catch (err) {
        toast.error("Failed to load table. Please scan QR code again.");
      }
    })();
  }, [tableId, loadSessionFromStorage, tokenExpired, navigate]);

  /* ========== SUBMIT PIN ========== */
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (pin.length !== 4) {
      toast.error("Please enter a 4-digit PIN");
      return;
    }

    const success = tokenExpired
      ? await resumeSession(pin)
      : await verifyPin(pin);

    if (success) {
      // Redirect to menu
      setTimeout(() => {
        navigate("menu");
      }, 500);
    } else {
      // Clear PIN for next attempt
      setPin("");
    }
  };

  /* ========== IF ALREADY AUTHENTICATED ========== */
  if (isAuthenticated && !tokenExpired) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full text-center">
          <div className="mb-6">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg
                className="w-8 h-8 text-green-600"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Welcome!</h2>
            <p className="text-sm text-slate-500 mt-2">
              Your session is active. Redirecting...
            </p>
          </div>

          <div className="animate-pulse">
            <div className="h-2 bg-slate-200 rounded-full overflow-hidden">
              <div className="h-full bg-orange-500 rounded-full w-2/3 animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
      <div className="bg-white rounded-3xl shadow-2xl p-8 max-w-sm w-full">
        {/* ========== HEADER ========== */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-orange-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
              />
            </svg>
          </div>

          <h1 className="text-3xl font-bold text-slate-900">Order Now</h1>
          <p className="text-sm text-slate-500 mt-2">
            {tableName} • Table #{table?.tableNumber || "..."}
          </p>
        </div>

        {/* ========== RECOVERY MODE ========== */}
        {tokenExpired && (
          <div className="mb-6 p-4 bg-amber-50 border border-amber-200 rounded-xl">
            <p className="text-sm text-amber-900 font-medium">
              ⏰ Your session expired. Please re-enter PIN to continue.
            </p>
          </div>
        )}

        {/* ========== ERROR DISPLAY ========== */}
        {pinError && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-900 font-medium">{pinError}</p>
          </div>
        )}

        {/* ========== PIN FORM ========== */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-3">
              {tokenExpired ? "Re-enter PIN" : "Enter Table PIN"}
            </label>
            <input
              type="password"
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              placeholder="••••"
              className="w-full h-16 border-2 border-slate-300 rounded-2xl text-center text-4xl tracking-widest font-bold focus:outline-none focus:border-orange-500 transition-colors"
              disabled={loading}
            />
            <p className="text-xs text-slate-500 mt-2 text-center">
              Ask your waiter for the PIN
            </p>
          </div>

          {/* ========== SUBMIT BUTTON ========== */}
          <button
            type="submit"
            disabled={loading || pin.length !== 4}
            className="w-full h-12 bg-orange-600 text-white rounded-2xl font-semibold text-lg hover:bg-orange-700 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Verifying...
              </>
            ) : (
              <>
                <span>Continue</span>
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </>
            )}
          </button>
        </form>

        {/* ========== TABLE INFO ========== */}
        {table && (
          <div className="mt-8 pt-8 border-t border-slate-200 grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-slate-500 font-medium">Table</p>
              <p className="text-lg font-bold text-slate-900">
                #{table.tableNumber}
              </p>
            </div>
            <div>
              <p className="text-xs text-slate-500 font-medium">Seats</p>
              <p className="text-lg font-bold text-slate-900">
                {table.seatingCapacity}
              </p>
            </div>
          </div>
        )}

        {/* ========== SECURITY NOTE ========== */}
        <div className="mt-6 p-3 bg-slate-50 rounded-lg">
          <p className="text-xs text-slate-600 flex items-center gap-2">
            <svg
              className="w-4 h-4 text-green-600"
              fill="currentColor"
              viewBox="0 0 20 20"
            >
              <path
                fillRule="evenodd"
                d="M5.293 9.707a1 1 0 010-1.414L10 3.586l4.707 4.707a1 1 0 01-1.414 1.414L10 6.414l-3.293 3.293a1 1 0 01-1.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Secure • PIN is encrypted
          </p>
        </div>
      </div>
    </div>
  );
}
