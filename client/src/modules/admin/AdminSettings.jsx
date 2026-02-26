import React, { useState, useEffect } from "react";
import {
  Settings,
  Save,
  AlertCircle,
  Lock,
  DollarSign,
  Phone,
  Mail,
  MapPin,
  Store,
  FileText,
  Loader2,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import AuthAxios from "../../api/authAxios";
import settingsApi from "../../api/settings.api";
import toast from "react-hot-toast";
import { updateBrandSettings } from "../../store/brand/brandSlice";
import { setUserDetails } from "../../store/auth/userSlice";

// Component definitions outside to prevent re-creation on each render
const SettingGroup = ({ title, icon: Icon, children }) => (
  <div className="bg-white rounded-lg p-5 sm:p-6 space-y-4 border border-gray-200">
    <h3 className="text-base font-semibold text-gray-900 flex items-center gap-2">
      {Icon && <Icon size={20} className="text-[#FC8019]" />}
      {title}
    </h3>
    {children}
  </div>
);

const SettingField = ({
  label,
  value,
  onChange,
  type = "text",
  help,
  icon: Icon,
}) => (
  <div>
    <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
      {Icon && <Icon size={16} className="text-[#FC8019]" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full h-11 border border-gray-200 rounded-lg px-4 text-sm font-medium bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all"
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
    <div className="min-h-screen bg-gray-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#FC8019] to-[#FF6B35] rounded-lg">
              <Settings className="text-white" size={24} />
            </div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
          </div>
          <p className="text-gray-600 text-sm">
            Manage your restaurant details, profile, security, and billing
            settings
          </p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-gray-200 overflow-x-auto pb-0">
          {["restaurant", "profile", "security", "billing"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={clsx(
                "px-4 py-3 text-sm font-semibold whitespace-nowrap border-b-2 transition-all",
                activeTab === tab
                  ? "text-[#FC8019] border-[#FC8019]"
                  : "text-gray-600 border-transparent hover:text-gray-900",
              )}
            >
              {tab === "restaurant" && "🏪 Restaurant"}
              {tab === "profile" && "👤 Profile"}
              {tab === "security" && "🔒 Security"}
              {tab === "billing" && "💳 Billing"}
            </button>
          ))}
        </div>

        {/* Restaurant Settings */}
        {activeTab === "restaurant" && (
          <div className="space-y-5">
            <SettingGroup title="Restaurant Information" icon={Store}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="Store Name"
                  icon={Store}
                  value={settings.storeName}
                  onChange={(val) => handleSettingsChange("storeName", val)}
                />
                <SettingField
                  label="Phone"
                  icon={Phone}
                  value={settings.phone}
                  onChange={(val) => handleSettingsChange("phone", val)}
                  type="tel"
                />
                <SettingField
                  label="Email"
                  icon={Mail}
                  value={settings.email}
                  onChange={(val) => handleSettingsChange("email", val)}
                  type="email"
                />
                <SettingField
                  label="Address"
                  icon={MapPin}
                  value={settings.address}
                  onChange={(val) => handleSettingsChange("address", val)}
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-2">
                  <FileText size={16} className="text-[#FC8019]" />
                  Description
                </label>
                <textarea
                  value={settings.description}
                  onChange={(e) =>
                    handleSettingsChange("description", e.target.value)
                  }
                  rows="4"
                  className="w-full border border-gray-200 rounded-lg px-4 py-2 text-sm font-medium resize-none bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-[#FC8019]/40 focus:border-[#FC8019] transition-all"
                />
              </div>
            </SettingGroup>

            <SettingGroup title="Compliance Documents" icon={FileText}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("profile");
                }}
                className="h-11 px-6 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Next
              </button>
              <button
                onClick={saveRestaurantSettings}
                disabled={saving}
                className={clsx(
                  "h-11 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2",
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
                )}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}

        {/* Profile Settings */}
        {activeTab === "profile" && (
          <div className="space-y-5">
            <SettingGroup title="Profile Information">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <SettingField
                  label="Full Name"
                  value={userSettings.name}
                  onChange={(val) => handleUserChange("name", val)}
                />
                <SettingField
                  label="Email"
                  icon={Mail}
                  value={userSettings.email}
                  onChange={(val) => handleUserChange("email", val)}
                  type="email"
                />
                <SettingField
                  label="Phone"
                  icon={Phone}
                  value={userSettings.phone}
                  onChange={(val) => handleUserChange("phone", val)}
                  type="tel"
                />
              </div>
            </SettingGroup>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("security");
                }}
                className="h-11 px-6 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Next
              </button>
              <button
                onClick={saveUserProfile}
                disabled={saving}
                className={clsx(
                  "h-11 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2",
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
                )}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Updating..." : "Update Profile"}
              </button>
            </div>
          </div>
        )}

        {/* Security Settings */}
        {activeTab === "security" && (
          <div className="space-y-5">
            <SettingGroup title="Change Password" icon={Lock}>
              <div className="bg-orange-50 rounded-lg p-4 mb-5 border border-orange-200">
                <p className="text-sm text-orange-800 flex items-start gap-2">
                  <AlertCircle size={16} className="flex-shrink-0 mt-0.5" />
                  <span>
                    Use a strong password with at least 6 characters. Protect
                    your account by using unique credentials.
                  </span>
                </p>
              </div>
              <div className="space-y-4">
                <SettingField
                  label="Current Password"
                  icon={Lock}
                  value={passwords.current}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, current: val }))
                  }
                  type="password"
                />
                <SettingField
                  label="New Password"
                  icon={Lock}
                  value={passwords.new}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, new: val }))
                  }
                  type="password"
                  help="At least 6 characters recommended"
                />
                <SettingField
                  label="Confirm Password"
                  icon={Lock}
                  value={passwords.confirm}
                  onChange={(val) =>
                    setPasswords((prev) => ({ ...prev, confirm: val }))
                  }
                  type="password"
                  help="Re-enter your new password"
                />
              </div>
            </SettingGroup>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("billing");
                }}
                className="h-11 px-6 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Next
              </button>
              <button
                onClick={changePassword}
                disabled={saving}
                className={clsx(
                  "h-11 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2",
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
                )}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Lock size={16} />
                )}
                {saving ? "Updating..." : "Change Password"}
              </button>
            </div>
          </div>
        )}

        {/* Billing Settings */}
        {activeTab === "billing" && (
          <div className="space-y-5">
            <SettingGroup title="Charges & Taxes" icon={DollarSign}>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <SettingField
                  label="Service Charge (%)"
                  icon={DollarSign}
                  value={settings.serviceCharge}
                  onChange={(val) =>
                    handleSettingsChange("serviceCharge", parseFloat(val) || 0)
                  }
                  type="number"
                  help="Percentage of order value"
                />
                <SettingField
                  label="Tax Rate (%)"
                  icon={DollarSign}
                  value={settings.taxRate}
                  onChange={(val) =>
                    handleSettingsChange("taxRate", parseFloat(val) || 0)
                  }
                  type="number"
                  help="Total GST percentage"
                />
                <SettingField
                  label="Delivery Fee (₹)"
                  icon={DollarSign}
                  value={settings.deliveryFee}
                  onChange={(val) =>
                    handleSettingsChange("deliveryFee", parseFloat(val) || 0)
                  }
                  type="number"
                  help="Fixed delivery charge"
                />
              </div>
            </SettingGroup>

            <div className="bg-gray-100 rounded-lg p-5 border border-gray-200">
              <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <DollarSign size={18} className="text-[#FC8019]" />
                Billing Summary
              </h4>
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Service Charge</p>
                  <p className="text-2xl font-bold text-[#FC8019]">
                    {settings.serviceCharge}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Tax Rate</p>
                  <p className="text-2xl font-bold text-[#FC8019]">
                    {settings.taxRate}%
                  </p>
                </div>
                <div className="bg-white rounded-lg p-4 border border-gray-200 text-center">
                  <p className="text-xs text-gray-600 mb-1">Delivery Fee</p>
                  <p className="text-2xl font-bold text-[#FC8019]">
                    ₹{settings.deliveryFee}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setActiveTab("restaurant");
                }}
                className="h-11 px-6 rounded-lg text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-all active:scale-[0.98]"
              >
                Back
              </button>
              <button
                onClick={saveRestaurantSettings}
                disabled={saving}
                className={clsx(
                  "h-11 px-6 rounded-lg text-sm font-semibold transition-all active:scale-[0.98] flex items-center gap-2",
                  saving
                    ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#FC8019] to-[#FF6B35] text-white hover:shadow-md",
                )}
              >
                {saving ? (
                  <Loader2 className="animate-spin" size={16} />
                ) : (
                  <Save size={16} />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
