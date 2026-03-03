import React, { useState } from "react";
import { FiSave, FiLock, FiAlertCircle } from "react-icons/fi";
import AuthAxios from "../../api/authAxios";
import settingsApi from "../../api/settings.api";
import toast from "react-hot-toast";

// Component definition outside to prevent re-creation on each render
const ToggleSetting = ({ label, value, onChange, help }) => (
  <div className="flex items-start justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
    <div>
      <p className="font-semibold text-gray-900">{label}</p>
      {help && <p className="text-xs text-gray-500 mt-1">{help}</p>}
    </div>
    <input
      type="checkbox"
      checked={value}
      onChange={(e) => onChange(e.target.checked)}
      className="w-4 h-4 rounded cursor-pointer"
    />
  </div>
);

export default function ManagerSettings() {
  const [settings, setSettings] = useState({
    autoSeating: true,
    kitchenAlerts: true,
    paymentReminder: true,
    emailReports: false,
  });

  const [permissions, setPermissions] = useState({
    canDeleteOrder: false,
    canApplyDiscount: true,
    canApproveRefund: true,
    canManageStaff: false,
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState("preferences");

  const saveSettings = async () => {
    try {
      setSaving(true);
      const config = settingsApi.updateManagerSettings;
      const res = await AuthAxios[config.method.toLowerCase()](config.url, {
        settings,
        permissions,
      });

      if (res.data?.success) {
        toast.success("Settings updated");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error("Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords don't match");
      return;
    }

    if (passwords.new.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    try {
      setSaving(true);
      const config = settingsApi.changeManagerPassword;
      const res = await AuthAxios[config.method.toLowerCase()](
        config.url,
        passwords,
      );

      if (res.data?.success) {
        toast.success("Password changed");
        setPasswords({ current: "", new: "", confirm: "" });
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error("Failed to change password");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 sm:py-10 space-y-6">
        <div>
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
            Global Settings
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Manage preferences, permissions and security
          </p>
        </div>

        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto">
          {["preferences", "permissions", "security"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-3 font-semibold text-sm transition border-b-2 capitalize ${
                activeTab === tab
                  ? "border-orange-500 text-orange-600"
                  : "border-transparent text-gray-600 hover:text-gray-900"
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {activeTab === "preferences" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Notification Preferences
              </h3>

              <ToggleSetting
                label="Auto Seating Alerts"
                value={settings.autoSeating}
                onChange={(val) =>
                  setSettings({ ...settings, autoSeating: val })
                }
                help="Get alerts when tables become available"
              />

              <ToggleSetting
                label="Kitchen Alerts"
                value={settings.kitchenAlerts}
                onChange={(val) =>
                  setSettings({ ...settings, kitchenAlerts: val })
                }
                help="Receive kitchen order notifications"
              />

              <ToggleSetting
                label="Payment Reminders"
                value={settings.paymentReminder}
                onChange={(val) =>
                  setSettings({ ...settings, paymentReminder: val })
                }
                help="Get reminded for pending bill payments"
              />

              <ToggleSetting
                label="Email Daily Reports"
                value={settings.emailReports}
                onChange={(val) =>
                  setSettings({ ...settings, emailReports: val })
                }
                help="Receive daily summary reports via email"
              />
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
              >
                <FiSave size={16} />
                {saving ? "Saving..." : "Save Preferences"}
              </button>
            </div>
          </div>
        )}

        {activeTab === "permissions" && (
          <div className="space-y-6">
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3">
              <FiAlertCircle
                className="text-amber-600 flex-shrink-0"
                size={20}
              />
              <div className="text-sm text-amber-800">
                <p className="font-semibold">Limited Access</p>
                <p>You have restricted permissions. Contact admin to modify.</p>
              </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                My Permissions
              </h3>

              <ToggleSetting
                label="Delete Orders"
                value={permissions.canDeleteOrder}
                onChange={() => {}}
                help="Can permanently delete customer orders"
              />

              <ToggleSetting
                label="Apply Discounts"
                value={permissions.canApplyDiscount}
                onChange={() => {}}
                help="Can apply discounts to bills"
              />

              <ToggleSetting
                label="Approve Refunds"
                value={permissions.canApproveRefund}
                onChange={() => {}}
                help="Can approve refund requests"
              />

              <ToggleSetting
                label="Manage Staff"
                value={permissions.canManageStaff}
                onChange={() => {}}
                help="Can hire/remove staff members"
              />
            </div>

            <p className="text-xs text-gray-500 text-center">
              Contact administrator to change these permissions
            </p>
          </div>
        )}

        {activeTab === "security" && (
          <div className="space-y-6">
            <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-4">
              <h3 className="text-lg font-bold text-gray-900">
                Change Password
              </h3>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Current Password
                </label>
                <input
                  type="password"
                  value={passwords.current}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      current: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  New Password
                </label>
                <input
                  type="password"
                  value={passwords.new}
                  onChange={(e) =>
                    setPasswords((prev) => ({ ...prev, new: e.target.value }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
                <p className="text-xs text-gray-500 mt-1">
                  At least 6 characters
                </p>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={passwords.confirm}
                  onChange={(e) =>
                    setPasswords((prev) => ({
                      ...prev,
                      confirm: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm"
                />
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={changePassword}
                disabled={saving}
                className="flex items-center gap-2 px-6 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold disabled:opacity-50"
              >
                <FiLock size={16} />
                {saving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
