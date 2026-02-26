import React, { useState, useEffect } from "react";
import {
  FiSettings,
  FiSave,
  FiAlertCircle,
  FiLock,
  FiDollarSign,
  FiPhone,
} from "react-icons/fi";
import { useSelector, useDispatch } from "react-redux";
import AuthAxios from "../../api/authAxios";
import settingsApi from "../../api/settings.api";
import toast from "react-hot-toast";
import { updateBrandSettings } from "../../store/brand/brandSlice";
import { setUserDetails } from "../../store/auth/userSlice";

// Component definitions outside to prevent re-creation on each render
const SettingGroup = ({ title, children }) => (
  <div className="bg-gray-50 rounded-xl p-6 sm:p-8 space-y-5 sm:space-y-7 border border-gray-200 hover:border-gray-300 transition-all duration-300">
    <h3 className="text-lg sm:text-xl font-bold tracking-tight text-gray-900">
      {title}
    </h3>
    {children}
  </div>
);

const SettingField = ({ label, value, onChange, type = "text", help }) => (
  <div>
    <label className="block text-sm font-semibold text-gray-700 mb-2">
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
    />
    {help && <p className="text-xs text-gray-500 mt-2">{help}</p>}
  </div>
);

export default function AdminSettings() {
  const dispatch = useDispatch();
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
    phone: user?.mobile || "",
  });

  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const [activeTab, setActiveTab] = useState("restaurant");
  const [saving, setSaving] = useState(false);

  // Update local state when brand changes
  useEffect(() => {
    if (brand) {
      setSettings({
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
    }
  }, [brand]);

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
        // Update Redux store with new brand settings
        if (res.data.data) {
          dispatch(updateBrandSettings(res.data.data));
        }
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
        // Update Redux store with new user details
        if (res.data.data) {
          dispatch(setUserDetails(res.data.data));
        }
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

  return (
    <div className="min-h-screen bg-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-10 sm:space-y-12 animate-in fade-in duration-500">
        {/* Header */}
        <div className="pb-6 border-b border-gray-200">
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-gray-900">
            ⚙️ Settings & Configuration
          </h1>
          <p className="text-sm sm:text-base text-gray-600 mt-2">
            Manage your restaurant details, profile, security, and billing
            settings
          </p>
        </div>

        {/* Tabs */}
        <div className="overflow-x-auto">
          <div className="flex gap-2 sm:gap-4 flex-nowrap pb-4 border-b border-gray-200">
            {["restaurant", "profile", "security", "billing"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-5 sm:px-7 py-3 rounded-lg font-semibold text-sm whitespace-nowrap transition-all ${
                  activeTab === tab
                    ? "bg-gradient-to-r from-indigo-600 to-blue-600 text-white"
                    : "bg-white text-gray-700 hover:text-gray-900 border border-gray-200"
                }`}
              >
                {tab === "restaurant" && "🏪 "}
                {tab === "profile" && "👤 "}
                {tab === "security" && "🔒 "}
                {tab === "billing" && "💳 "}
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    handleSettingsChange("description", e.target.value)
                  }
                  rows="4"
                  className="w-full px-4 py-3 rounded-lg bg-white border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-600 focus:border-indigo-600 text-sm transition"
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
                className="flex items-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
                className="flex items-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
              <div className="bg-amber-50 rounded-lg p-4 mb-6 border border-amber-200">
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
                className="flex items-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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

            <div className="bg-indigo-50 rounded-lg p-4 sm:p-6 border border-indigo-200">
              <h4 className="font-semibold text-indigo-900 mb-3">
                💡 Billing Summary
              </h4>
              <div className="grid grid-cols-3 gap-4 text-center">
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-indigo-100">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Service Charge
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {settings.serviceCharge}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-indigo-100">
                  <p className="text-xs sm:text-sm text-gray-600">Tax Rate</p>
                  <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                    {settings.taxRate}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-3 sm:p-4 border border-indigo-100">
                  <p className="text-xs sm:text-sm text-gray-600">
                    Delivery Fee
                  </p>
                  <p className="text-lg sm:text-2xl font-bold text-indigo-600">
                    ₹{settings.deliveryFee}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={saveRestaurantSettings}
                disabled={saving}
                className="flex items-center gap-2 px-7 sm:px-10 py-3.5 sm:py-4 bg-gradient-to-r from-indigo-600 to-blue-600 text-white rounded-lg hover:shadow-lg hover:shadow-indigo-500/30 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
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
