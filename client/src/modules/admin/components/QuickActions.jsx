import React, { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import {
  FiPlus,
  FiSettings,
  FiPrinter,
  FiRefreshCw,
  FiDownload,
  FiBell,
  FiUsers,
  FiBarChart2,
} from "react-icons/fi";
import Axios from "../../../api/axios";

/**
 * Quick Action Button
 */
const QuickActionButton = ({
  icon: Icon,
  label,
  onClick,
  variant = "default",
  loading = false,
}) => {
  const variants = {
    default:
      "bg-white text-slate-700 border border-slate-200 hover:bg-slate-50",
    primary: "bg-blue-600 text-white hover:bg-blue-700",
    success: "bg-green-600 text-white hover:bg-green-700",
  };

  return (
    <button
      onClick={onClick}
      disabled={loading}
      className={`flex flex-col items-center gap-2 px-4 py-3 rounded-lg font-medium text-sm transition-all ${variants[variant]} hover:shadow-md disabled:opacity-50 disabled:cursor-not-allowed`}
    >
      <Icon size={20} className={loading ? "animate-spin" : ""} />
      <span className="text-center text-xs">{label}</span>
    </button>
  );
};

/**
 * Quick Actions Component
 */
export const QuickActions = () => {
  const navigate = useNavigate();
  const { brandSlug } = useParams();
  const [loading, setLoading] = useState(null);

  const handleNewOrder = () => {
    navigate("/order-placement");
    toast.success("Opening Order Placement");
  };

  const handlePrintBill = async () => {
    const toastId = toast.loading("Loading recent bills...");
    setLoading("print");

    try {
      // Fetch recent bills from API
      const response = await Axios.get("/api/bills?limit=5&sort=-createdAt");

      if (response.data?.data && response.data.data.length > 0) {
        const bills = response.data.data;
        const printHTML = generateBillPrintTemplate(bills);
        printDocument(printHTML);
        toast.success("Opening print preview...", { id: toastId });
      } else {
        toast.error("No bills found to print", { id: toastId });
      }
    } catch (err) {
      // Fallback to simple print if API fails
      console.error("Failed to fetch bills:", err);
      toast.success("Opening print preview...", { id: toastId });
      window.print();
    } finally {
      setLoading(null);
    }
  };

  const handleExportReport = async () => {
    const toastId = toast.loading("Generating report...");
    setLoading("export");

    try {
      // Fetch report data from backend
      const response = await Axios.get("/api/dashboard/report/export");

      if (response.data?.data) {
        // Create CSV from data
        const csv = convertToCSV(response.data.data);
        downloadCSV(csv, "dashboard-report.csv");
        toast.success("Report exported successfully", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to export report", { id: toastId });
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleRefreshData = () => {
    toast.success("Refreshing data...");
    window.location.reload();
  };

  const handleSendAlert = async () => {
    const toastId = toast.loading("Sending alert to staff...");
    setLoading("alert");

    try {
      const response = await Axios.post("/api/notifications/send-alert", {
        title: "Admin Alert",
        message: "Critical action required",
        priority: "HIGH",
      });

      if (response.data?.success) {
        toast.success("Alert sent to all staff", { id: toastId });
      }
    } catch (err) {
      toast.error("Failed to send alert", { id: toastId });
      console.error(err);
    } finally {
      setLoading(null);
    }
  };

  const handleTeamStatus = () => {
    navigate(`/${brandSlug}/admin/staff-status`);
    toast.success("Loading team status");
  };

  const handleViewAnalytics = () => {
    navigate(`/${brandSlug}/admin/analytics`);
    toast.success("Opening analytics dashboard");
  };

  const handleSettings = () => {
    navigate(`/${brandSlug}/admin/settings`);
    toast.success("Opening settings");
  };

  const actions = [
    // {
    //   icon: FiPlus,
    //   label: "New Order",
    //   onClick: handleNewOrder,
    //   variant: "primary",
    // },
    {
      icon: FiPrinter,
      label: "Print Bill",
      onClick: handlePrintBill,
    },
    {
      icon: FiDownload,
      label: "Export Report",
      onClick: handleExportReport,
      id: "export",
    },
    {
      icon: FiRefreshCw,
      label: "Refresh Data",
      onClick: handleRefreshData,
    },
    {
      icon: FiBell,
      label: "Send Alert",
      onClick: handleSendAlert,
      id: "alert",
    },
    {
      icon: FiUsers,
      label: "Team Status",
      onClick: handleTeamStatus,
    },
    {
      icon: FiBarChart2,
      label: "View Analytics",
      onClick: handleViewAnalytics,
    },
    {
      icon: FiSettings,
      label: "Settings",
      onClick: handleSettings,
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-6">
      <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-2">
        {actions.map((action, idx) => (
          <QuickActionButton
            key={idx}
            icon={action.icon}
            label={action.label}
            onClick={action.onClick}
            variant={action.variant}
            loading={loading === action.id}
          />
        ))}
      </div>
    </div>
  );
};

/**
 * Convert data to CSV format
 */
function convertToCSV(data) {
  if (!Array.isArray(data) || data.length === 0) return "";

  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(",");

  const csvRows = data.map((row) =>
    headers
      .map((header) => {
        const value = row[header];
        return typeof value === "string" && value.includes(",")
          ? `"${value}"`
          : value;
      })
      .join(","),
  );

  return [csvHeaders, ...csvRows].join("\n");
}

/**
 * Download CSV file
 */
function downloadCSV(csv, filename) {
  const blob = new Blob([csv], { type: "text/csv" });
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  window.URL.revokeObjectURL(url);
}
/**
 * Generate bill print template HTML
 */
function generateBillPrintTemplate(bills) {
  const billsHTML = bills
    .map(
      (bill, idx) => `
    <div class="bill-container">
      <div class="bill-header">
        <h2>RESTAURANT BILL</h2>
        <p class="bill-number">Bill #${bill._id?.slice(-6) || idx + 1}</p>
      </div>

      <div class="bill-details">
        <div class="detail-row">
          <span class="label">Date:</span>
          <span>${bill.createdAt ? new Date(bill.createdAt).toLocaleDateString() : "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="label">Time:</span>
          <span>${bill.createdAt ? new Date(bill.createdAt).toLocaleTimeString() : "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="label">Table:</span>
          <span>${bill.tableNo || "N/A"}</span>
        </div>
        <div class="detail-row">
          <span class="label">Guests:</span>
          <span>${bill.guestCount || 0}</span>
        </div>
      </div>

      <div class="bill-items">
        <table>
          <thead>
            <tr>
              <th>Item</th>
              <th class="text-right">Qty</th>
              <th class="text-right">Price</th>
              <th class="text-right">Amount</th>
            </tr>
          </thead>
          <tbody>
            ${
              (bill.items || [])
                .map(
                  (item) => `
              <tr>
                <td>${item.name || "N/A"}</td>
                <td class="text-right">${item.quantity || 0}</td>
                <td class="text-right">₹${(item.price || 0).toFixed(2)}</td>
                <td class="text-right">₹${((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
              </tr>
            `,
                )
                .join("") ||
              '<tr><td colspan="4" class="text-center">No items</td></tr>'
            }
          </tbody>
        </table>
      </div>

      <div class="bill-summary">
        <div class="summary-row">
          <span>Subtotal:</span>
          <span>₹${(bill.subtotal || 0).toFixed(2)}</span>
        </div>
        ${bill.gst ? `<div class="summary-row"><span>GST (${bill.gst}%):</span><span>₹${(bill.gstAmount || 0).toFixed(2)}</span></div>` : ""}
        ${bill.discount ? `<div class="summary-row"><span>Discount:</span><span>-₹${bill.discount.toFixed(2)}</span></div>` : ""}
        <div class="summary-row total">
          <span>Total:</span>
          <span>₹${(bill.total || 0).toFixed(2)}</span>
        </div>
        <div class="summary-row">
          <span>Payment Mode:</span>
          <span>${bill.paymentMethod || "Cash"}</span>
        </div>
      </div>

      <div class="bill-footer">
        <p>Thank you for your visit!</p>
        <p class="text-sm">Please come again</p>
      </div>

      <div class="page-break"></div>
    </div>
  `,
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <title>Bills Print</title>
      <style>
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }

        body {
          font-family: 'Courier New', monospace;
          background: white;
          color: #333;
          line-height: 1.4;
        }

        .bill-container {
          width: 80mm;
          margin: 0 auto;
          padding: 10mm;
          background: white;
          border: 1px solid #ddd;
          page-break-after: always;
        }

        .bill-header {
          text-align: center;
          margin-bottom: 15px;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
        }

        .bill-header h2 {
          font-size: 18px;
          font-weight: bold;
          margin-bottom: 5px;
        }

        .bill-number {
          font-size: 12px;
          font-weight: bold;
        }

        .bill-details {
          font-size: 11px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #999;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 3px;
        }

        .detail-row .label {
          font-weight: bold;
        }

        .bill-items {
          margin-bottom: 15px;
          font-size: 11px;
        }

        table {
          width: 100%;
          border-collapse: collapse;
        }

        thead {
          border-bottom: 1px solid #000;
        }

        th {
          text-align: left;
          padding: 3px;
          font-weight: bold;
          border-bottom: 1px solid #000;
        }

        th.text-right {
          text-align: right;
        }

        td {
          padding: 2px 3px;
        }

        td.text-right {
          text-align: right;
        }

        td.text-center {
          text-align: center;
        }

        tbody tr {
          border-bottom: 1px dotted #ddd;
        }

        .bill-summary {
          font-size: 11px;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px dashed #999;
        }

        .summary-row {
          display: flex;
          justify-content: space-between;
          margin-bottom: 2px;
        }

        .summary-row.total {
          font-weight: bold;
          font-size: 13px;
          margin-top: 5px;
          padding-top: 5px;
          border-top: 1px solid #000;
        }

        .bill-footer {
          text-align: center;
          font-size: 10px;
          margin-top: 10px;
        }

        .bill-footer p {
          margin-bottom: 2px;
        }

        .text-sm {
          font-size: 9px;
        }

        .page-break {
          page-break-after: always;
        }

        @media print {
          body {
            margin: 0;
            padding: 0;
          }

          .bill-container {
            margin: 0;
            border: none;
            padding: 0;
            page-break-inside: avoid;
          }

          .page-break {
            page-break-after: always;
          }
        }
      </style>
    </head>
    <body>
      ${billsHTML}
    </body>
    </html>
  `;
}

/**
 * Open print dialog with custom HTML
 */
function printDocument(htmlContent) {
  const printWindow = window.open("", "_blank");
  printWindow.document.write(htmlContent);
  printWindow.document.close();

  // Wait for content to load before printing
  setTimeout(() => {
    printWindow.focus();
    printWindow.print();
  }, 250);
}
