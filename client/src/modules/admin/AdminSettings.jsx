import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiSave,
  FiAlertCircle,
  FiLock,
  FiDollarSign,
  FiPhone,
} from "react-icons/fi";
import { useSelector } from "react-redux";
import AuthAxios from "../../api/authAxios";
import settingsApi from "../../api/settings.api";
import toast from "react-hot-toast";

export default function AdminSettings() {
  const user = useSelector((state) => state.user);
  const { brand } = useSelector((state) => state.brand);

  const [settings, setSettings] = useState({
    storeName: brand?.storeName || "",
    address: brand?.address || "",
    phone: brand?.phone || "",
    email: brand?.email || "",
    description: brand?.description || "",
    gst: brand?.gst || "",
    fssai: brand?.fssai || "",
    serviceCharge: brand?.serviceCharge || 0,
    taxRate: brand?.taxRate || 0,
    deliveryFee: brand?.deliveryFee || 0,
  });

  const [userSettings, setUserSettings] = useState({
    name: user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [activeTab, setActiveTab] = useState("restaurant");
  const [saving, setSaving] = useState(false);

  const handleSettingsChange = (field, value) => {
    setSettings((prev) => ({ ...prev, [field]: value }));
  };

  const handleUserChange = (field, value) => {
    setUserSettings((prev) => ({ ...prev, [field]: value }));
  };

  const saveRestaurantSettings = async () => {
    try {
      setSaving(true);
      const config = settingsApi.updateRestaurantSettings;
      const res = await AuthAxios[config.method.toLowerCase()](
        config.url,
        settings,
      );

      if (res.data?.success) {
        toast.success("Restaurant settings updated");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveUserProfile = async () => {
    try {
      setSaving(true);
      const config = settingsApi.updateAdminProfile;
      const res = await AuthAxios[config.method.toLowerCase()](
        config.url,
        userSettings,
      );

      if (res.data?.success) {
        toast.success("Profile updated");
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      toast.error("Failed to update profile");
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
      const config = settingsApi.changeAdminPassword;
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

  const SettingGroup = ({ title, children }) => (
    <div className="bg-white border border-slate-200 rounded-xl p-6 sm:p-8 space-y-4 sm:space-y-6 shadow-sm hover:shadow-md transition-shadow">
      <h3 className="text-lg sm:text-xl font-bold text-slate-900">{title}</h3>
      {children}
    </div>
  );

  const SettingField = ({ label, value, onChange, type = "text", help }) => (
    <div>
      <label className="block text-sm font-semibold text-slate-700 mb-2">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent text-sm transition"
      />
      {help && <p className="text-xs text-slate-500 mt-2">{help}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-orange-50 to-slate-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-6 sm:space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-900">
            ⚙️ Settings
          </h1>
          <p className="text-sm sm:text-base text-slate-600 mt-2">
            Manage your restaurant details, profile, security, and billing
            settings
          </p>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 border-b-2 border-slate-200 flex-nowrap pb-4">
            {["restaurant", "profile", "security", "billing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 sm:px-6 py-3 font-semibold text-sm whitespace-nowrap transition-all relative ${
                  activeTab === tab
                    ? "text-orange-600"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                {tab === "restaurant" && "🏪 "}
                {tab === "profile" && "👤 "}
                {tab === "security" && "🔒 "}
                {tab === "billing" && "💳 "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Restaurant Settings */}
        {activeTab === "restaurant" && (
          <div className="space-y-6 sm:space-y-8">
            <SettingGroup title="🏪 Restaurant Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <SettingField
                  label="Store Name"
                  value={settings.storeName}
                  onChange={(val) => handleSettingsChange("storeName", val)}
                />
                <SettingField
                  label="Phone"
                  value={settings.phone}
                  onChange={(val) => handleSettingsChange("phone", val)}
                  type="tel"
                />
                <SettingField
                  label="Email"
                  value={settings.email}
                  onChange={(val) => handleSettingsChange("email", val)}
                  type="email"
                />
                <SettingField
                  label="Address"
                  value={settings.address}
                  onChange={(val) => handleSettingsChange("address", val)}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    handleSettingsChange("description", e.target.value)
                  }
                  rows="4"
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 text-sm transition"
                />
              </div>
            </SettingGroup>

            <SettingGroup title="📋 Compliance Documents">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <SettingField
                  label="GST Number"
                  value={settings.gst}
                  onChange={(val) => handleSettingsChange("gst", val)}
                  help="Your GST registration number (optional)"
                />
                <SettingField
                  label="FSSAI License"
                  value={settings.fssai}
                  onChange={(val) => handleSettingsChange("fssai", val)}
                  help="Your FSSAI license number (optional)"
                />
              </div>
            </SettingGroup>

            <div className="flex justify-end">
              <button
                onClick={saveRestaurantSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-6 sm:space-y-8">
            <SettingGroup title="👤 Profile Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                <SettingField
                  label="Full Name"
                  value={userSettings.name}
                  onChange={(val) => handleUserChange("name", val)}
                />
                <SettingField
                  label="Email"
                  value={userSettings.email}
                  onChange={(val) => handleUserChange("email", val)}
                  type="email"
                />
                <SettingField
                  label="Phone"
                  value={userSettings.phone}
                  onChange={(val) => handleUserChange("phone", val)}
                  type="tel"
                />
              </div>
            </SettingGroup>

            <div className="flex justify-end">
              <button
                onClick={saveUserProfile}
                disabled={saving}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                {saving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-6 sm:space-y-8">
            <SettingGroup title="🔒 Change Password">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                <p className="text-sm text-amber-800 flex items-start gap-2">
                  <span>⚠️</span>
                  <span>
                    Use a strong password with at least 6 characters. Protect
                    your account by using unique credentials.
                  </span>
                </p>
              </div>
              <div className="space-y-4 sm:space-y-6">
                <SettingField
                  label="Current Password"
                  value={passwords.current}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, current: val }))
                  }
                  type="password"
                />
                <SettingField
                  label="New Password"
                  value={passwords.new}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, new: val }))
                  }
                  type="password"
                  help="At least 6 characters recommended for security"
                />
                <SettingField
                  label="Confirm Password"
                  value={passwords.confirm}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, confirm: val }))
                  }
                  type="password"
                  help="Re-enter your new password to confirm"
                />
              </div>
            </SettingGroup>

            <div className="flex justify-end">
              <button
                onClick={changePassword}
                disabled={saving}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg hover:shadow-lg hover:shadow-blue-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiLock size={18} />
                {saving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === "billing" && (
          <div className="space-y-6 sm:space-y-8">
            <SettingGroup title="💳 Charges & Taxes">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
                <SettingField
                  label="Service Charge (%)"
                  value={settings.serviceCharge}
                  onChange={(val) =>
                    handleSettingsChange("serviceCharge", parseFloat(val) || 0)
                  }
                  type="number"
                  help="Percentage charged as service fee"
                />
                <SettingField
                  label="Tax Rate (%)"
                  value={settings.taxRate}
                  onChange={(val) =>
                    handleSettingsChange("taxRate", parseFloat(val) || 0)
                  }
                  type="number"
                  help="GST or total tax percentage"
                />
                <SettingField
                  label="Delivery Fee (₹)"
                  value={settings.deliveryFee}
                  onChange={(val) =>
                    handleSettingsChange("deliveryFee", parseFloat(val) || 0)
                  }
                  type="number"
                  help="Fixed delivery charge in rupees"
                />
              </div>
            </SettingGroup>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 sm:p-6">
              <h4 className="font-semibold text-blue-900 mb-3">
                💡 Billing Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Service Charge
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {settings.serviceCharge}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-slate-600">Tax Rate</p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    {settings.taxRate}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-blue-100">
                  <p className="text-xs sm:text-sm text-slate-600">
                    Delivery Fee
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-blue-600">
                    ₹{settings.deliveryFee}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveRestaurantSettings}
                disabled={saving}
                className="flex items-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-lg hover:shadow-lg hover:shadow-emerald-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <FiSave size={18} />
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
