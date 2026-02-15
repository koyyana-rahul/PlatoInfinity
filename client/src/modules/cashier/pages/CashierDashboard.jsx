/**
 * Cashier Dashboard - 2026 Savory Modern
 * Payment processing, transaction management, and financial reconciliation
 */

import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import {
  CreditCard,
  DollarSign,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  Download,
  Search,
  Filter,
  Banknote,
  Loader2,
} from "lucide-react";

import Axios from "../../../api/axios";
import cashierApi from "../../../api/cashier.api";

/**
 * Payment method configuration
 */
const PAYMENT_METHODS = {
  CASH: { icon: Banknote, label: "Cash", color: "brand-primary" },
  CARD: { icon: CreditCard, label: "Card", color: "brand-accent" },
  ONLINE: { icon: DollarSign, label: "Online", color: "brand-cta" },
  WALLET: { icon: Banknote, label: "Wallet", color: "brand-primary" },
  CHEQUE: { icon: AlertCircle, label: "Cheque", color: "red-500" },
};

export default function CashierDashboard() {
  const auth = useSelector((state) => state.auth);
  const user = auth.user;

  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filterMethod, setFilterMethod] = useState("all");
  const [filterStatus, setFilterStatus] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [dateRange, setDateRange] = useState("today");

  /**
   * Fetch cashier data
   */
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [statsRes, transRes] = await Promise.all([
          Axios(cashierApi.getCashierStats(dateRange)),
          Axios(cashierApi.getTransactions({ dateRange, limit: 50 })),
        ]);

        if (statsRes.data?.success) {
          setStats(statsRes.data.data);
        }
        if (transRes.data?.success) {
          setTransactions(transRes.data.data || []);
        }
      } catch (error) {
        console.error("Failed to load cashier data:", error);
        toast.error("Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [dateRange]);

  /**
   * Manual refresh
   */
  const handleRefresh = async () => {
    try {
      setRefreshing(true);
      const [statsRes, transRes] = await Promise.all([
        Axios(cashierApi.getCashierStats(dateRange)),
        Axios(cashierApi.getTransactions({ dateRange, limit: 50 })),
      ]);

      if (statsRes.data?.success) {
        setStats(statsRes.data.data);
      }
      if (transRes.data?.success) {
        setTransactions(transRes.data.data || []);
      }
      toast.success("Dashboard updated");
    } catch (error) {
      toast.error("Failed to refresh");
    } finally {
      setRefreshing(false);
    }
  };

  /**
   * Export to CSV
   */
  const handleExport = () => {
    if (filteredTransactions.length === 0) {
      toast.error("No transactions to export");
      return;
    }

    const csv = [
      ["Transaction ID", "Amount", "Method", "Status", "Time"],
      ...filteredTransactions.map((t) => [
        t._id,
        `₹${Math.round(t.amount)}`,
        t.paymentMethod,
        t.status,
        new Date(t.createdAt).toLocaleString(),
      ]),
    ];

    const csvContent =
      "data:text/csv;charset=utf-8," +
      csv.map((row) => row.join(",")).join("\n");
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `transactions-${dateRange}.csv`);
    link.click();
    toast.success("Exported successfully");
  };

  /**
   * Filter transactions
   */
  const filteredTransactions = transactions.filter((t) => {
    if (filterMethod !== "all" && t.paymentMethod !== filterMethod)
      return false;
    if (filterStatus !== "all" && t.status !== filterStatus) return false;
    if (searchQuery && !t._id.includes(searchQuery)) return false;
    return true;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background-primary flex items-center justify-center">
        <div className="text-center">
          <Loader2 className="w-10 h-10 text-brand-cta animate-spin mx-auto mb-4" />
          <p className="text-text-secondary font-semibold">
            Loading dashboard...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background-primary">
      {/* HEADER */}
      <header className="bg-background-secondary border-b border-gray-200 p-4 md:p-6 sticky top-0 z-20 shadow-soft">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between gap-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 bg-brand-cta/10 rounded-lg flex items-center justify-center">
                <CreditCard size={20} className="text-brand-cta" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-text-primary">
                  Cashier Dashboard
                </h1>
                <p className="text-xs md:text-sm text-text-light mt-1">
                  Manage payments and transactions
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleExport}
                className="btn-ghost gap-2 inline-flex items-center justify-center py-2.5 px-4"
              >
                <Download size={18} />
                <span className="hidden md:inline font-semibold">Export</span>
              </button>
              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="btn-secondary gap-2 inline-flex items-center justify-center py-2.5 px-4"
              >
                <RefreshCw
                  size={18}
                  className={refreshing ? "animate-spin" : ""}
                />
                <span className="hidden md:inline font-semibold">Refresh</span>
              </button>
            </div>
          </div>

          {/* KEY METRICS */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4 mb-6">
            <MetricCard
              label="Total Collected"
              value={`₹${Math.round(stats?.totalCollected || 0)}`}
              icon={DollarSign}
              color="brand-primary"
            />
            <MetricCard
              label="Transactions"
              value={stats?.transactionCount || 0}
              icon={CreditCard}
              color="brand-cta"
            />
            <MetricCard
              label="Pending"
              value={`₹${Math.round(stats?.pendingAmount || 0)}`}
              icon={Clock}
              color="brand-accent"
            />
            <MetricCard
              label="Avg Transaction"
              value={`₹${Math.round((stats?.totalCollected || 0) / (stats?.transactionCount || 1))}`}
              icon={TrendingUp}
              color="brand-primary"
            />
          </div>

          {/* DATE RANGE SELECTOR */}
          <div className="flex items-center gap-2 flex-wrap">
            {["today", "week", "month"].map((range) => (
              <button
                key={range}
                onClick={() => setDateRange(range)}
                className={`px-4 py-2 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  dateRange === range
                    ? "bg-brand-cta text-white shadow-card"
                    : "bg-background-tertiary text-text-secondary hover:bg-gray-100"
                }`}
              >
                {range.charAt(0).toUpperCase() + range.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="p-4 md:p-6 max-w-7xl mx-auto">
        {/* FILTERS & SEARCH */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-3 md:gap-4">
          <div className="md:col-span-2 relative">
            <Search
              size={18}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-light"
            />
            <input
              type="text"
              placeholder="Search transaction ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="input-field pl-10 w-full"
            />
          </div>

          <select
            value={filterMethod}
            onChange={(e) => setFilterMethod(e.target.value)}
            className="input-field"
          >
            <option value="all">All Methods</option>
            {Object.entries(PAYMENT_METHODS).map(([key, val]) => (
              <option key={key} value={key}>
                {val.label}
              </option>
            ))}
          </select>

          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="input-field"
          >
            <option value="all">All Status</option>
            <option value="COMPLETED">Completed</option>
            <option value="PENDING">Pending</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>

        {/* TRANSACTIONS TABLE */}
        {filteredTransactions.length === 0 ? (
          <div className="card p-12 text-center">
            <AlertCircle
              size={40}
              className="text-text-light mx-auto mb-4 opacity-50"
            />
            <p className="text-text-secondary font-semibold">
              No transactions found
            </p>
            <p className="text-text-light text-sm mt-2">
              Try adjusting your filters or date range
            </p>
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-background-tertiary border-b border-gray-200">
                  <tr>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Transaction
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Method
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-4 md:px-6 py-3 text-left text-xs font-bold text-text-secondary uppercase tracking-wider">
                      Time
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  <AnimatePresence>
                    {filteredTransactions.map((transaction) => {
                      const methodConfig =
                        PAYMENT_METHODS[transaction.paymentMethod];
                      const isCompleted = transaction.status === "COMPLETED";

                      return (
                        <motion.tr
                          key={transaction._id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          exit={{ opacity: 0, x: 20 }}
                          className="hover:bg-background-tertiary transition-colors"
                        >
                          <td className="px-4 md:px-6 py-4">
                            <span className="text-xs md:text-sm font-mono text-text-primary">
                              {transaction._id.slice(-6).toUpperCase()}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span className="text-sm md:text-base font-bold text-text-primary">
                              ₹{Math.round(transaction.amount)}
                            </span>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <div className="flex items-center gap-2">
                              {methodConfig && (
                                <div
                                  className={`w-6 h-6 bg-${methodConfig.color}/10 rounded flex items-center justify-center`}
                                >
                                  <methodConfig.icon
                                    size={14}
                                    className={`text-${methodConfig.color}`}
                                  />
                                </div>
                              )}
                              <span className="text-xs md:text-sm font-semibold text-text-secondary">
                                {methodConfig?.label ||
                                  transaction.paymentMethod}
                              </span>
                            </div>
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-accent bg-brand-accent/10 px-3 py-1.5 rounded-lg">
                                <CheckCircle2 size={14} />
                                Completed
                              </span>
                            ) : transaction.status === "PENDING" ? (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-brand-primary bg-brand-primary/10 px-3 py-1.5 rounded-lg">
                                <Clock size={14} />
                                Pending
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-500 bg-red-50 px-3 py-1.5 rounded-lg">
                                <AlertCircle size={14} />
                                Failed
                              </span>
                            )}
                          </td>
                          <td className="px-4 md:px-6 py-4">
                            <span className="text-xs md:text-sm text-text-light">
                              {new Date(transaction.createdAt).toLocaleString()}
                            </span>
                          </td>
                        </motion.tr>
                      );
                    })}
                  </AnimatePresence>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* PAGINATION */}
        {filteredTransactions.length > 0 && (
          <div className="mt-6 text-center text-sm text-text-light">
            Showing {filteredTransactions.length} transaction
            {filteredTransactions.length !== 1 ? "s" : ""}
          </div>
        )}
      </main>
    </div>
  );
}

/**
 * Metric Card Component
 */
function MetricCard({ label, value, icon: Icon, color }) {
  return (
    <div className="card p-4 flex items-center gap-3">
      <div
        className={`w-10 h-10 bg-${color}/10 rounded-lg flex items-center justify-center`}
      >
        <Icon size={20} className={`text-${color}`} />
      </div>
      <div>
        <p className="text-xs font-semibold text-text-light uppercase tracking-wide">
          {label}
        </p>
        <p className="text-lg md:text-xl font-bold text-text-primary mt-1">
          {value}
        </p>
      </div>
    </div>
  );
}
