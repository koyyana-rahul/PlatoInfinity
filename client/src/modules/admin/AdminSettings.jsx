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
  ChevronRight,
  Building2,
  User,
} from "lucide-react";
import { useSelector, useDispatch } from "react-redux";
import clsx from "clsx";
import AuthAxios from "../../api/authAxios";
import settingsApi from "../../api/settings.api";
import { notify } from "../../utils/notify";
import { updateBrandSettings } from "../../store/brand/brandSlice";
import { setUserDetails } from "../../store/auth/userSlice";
import {
  validatePassword,
  passwordRequirementsText,
} from "../../utils/validation";

// Input Component
const FormInput = ({
  label,
  value,
  onChange,
  type = "text",
  icon: Icon,
  error,
  help,
}) => (
  <div>
    <label className="block text-sm font-semibold text-gray-900 mb-2">
      {Icon && <Icon size={16} className="inline-block mr-2 text-orange-500" />}
      {label}
    </label>
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={clsx(
        "w-full px-4 py-2.5 border-2 rounded-lg text-sm font-medium transition-all",
        "placeholder:text-gray-400 focus:outline-none",
        error
          ? "border-red-300 bg-red-50 focus:border-red-500 focus:ring-2 focus:ring-red-200"
          : "border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-2 focus:ring-orange-100",
      )}
    />
    {error && <p className="text-xs text-red-600 mt-1 font-medium">{error}</p>}
    {help && !error && <p className="text-xs text-gray-500 mt-1">{help}</p>}
  </div>
);

// Tab Component
const TabButton = ({ isActive, onClick, icon: Icon, label }) => (
  <button
    onClick={onClick}
    className={clsx(
      "flex items-center gap-2 px-4 py-3 rounded-lg font-semibold text-sm transition-all",
      isActive
        ? "bg-orange-500 text-white shadow-md"
        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200",
    )}
  >
    {Icon && <Icon size={18} />}
    {label}
  </button>
);

// Settings Card
const SettingsCard = ({ title, icon: Icon, children }) => (
  <div className="bg-white border border-gray-200 rounded-2xl p-6 space-y-4">
    <div className="flex items-center gap-3 pb-4 border-b border-gray-100">
      {Icon && (
        <div className="p-2.5 bg-orange-100 rounded-lg">
          <Icon className="text-orange-500" size={20} />
        </div>
      )}
      <h3 className="text-lg font-bold text-gray-900">{title}</h3>
    </div>
    {children}
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
  const [errors, setErrors] = useState({});

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
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const handleUserChange = (field, value) => {
    setUserSettings((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  const saveRestaurantSettings = async () => {
    const newErrors = {};
    if (!settings.storeName.trim())
      newErrors.storeName = "Store name is required";
    if (!settings.phone.trim()) newErrors.phone = "Phone is required";
    if (!settings.email.trim()) newErrors.email = "Email is required";
    if (!settings.address.trim()) newErrors.address = "Address is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const config = settingsApi.updateRestaurantSettings;
      const res = await AuthAxios[config.method.toLowerCase()](
        config.url,
        settings,
      );

      if (res.data?.success) {
        notify.success("Restaurant settings updated successfully");
        if (res.data.data) {
          dispatch(updateBrandSettings(res.data.data));
        }
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      notify.error(error.response?.data?.message || "Failed to save settings");
    } finally {
      setSaving(false);
    }
  };

  const saveUserProfile = async () => {
    const newErrors = {};
    if (!userSettings.name.trim()) newErrors.name = "Name is required";
    if (!userSettings.email.trim()) newErrors.email = "Email is required";

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.error("Please fill all required fields");
      return;
    }

    try {
      setSaving(true);
      const config = settingsApi.updateAdminProfile;
      const res = await AuthAxios[config.method.toLowerCase()](
        config.url,
        userSettings,
      );

      if (res.data?.success) {
        notify.success("Profile updated successfully");
        if (res.data.data) {
          dispatch(setUserDetails(res.data.data));
        }
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      notify.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const changePassword = async () => {
    const newErrors = {};
    if (!passwords.current.trim())
      newErrors.current = "Current password is required";
    if (!passwords.new.trim()) newErrors.new = "New password is required";
    if (!passwords.confirm.trim())
      newErrors.confirm = "Confirm password is required";
    if (passwords.new !== passwords.confirm)
      newErrors.confirm = "Passwords don't match";
    if (!validatePassword(passwords.new))
      newErrors.new = passwordRequirementsText;

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      notify.error("Please fix the errors below");
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
        notify.success("Password changed successfully");
        setPasswords({ current: "", new: "", confirm: "" });
        setErrors({});
      }
    } catch (error) {
      console.error("❌ Error:", error.message);
      notify.error(
        error.response?.data?.message || "Failed to change password",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-orange-50 p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Settings className="text-white" size={24} />
                </div>
                <h1 className="text-3xl sm:text-4xl font-black text-gray-900">
                  Settings
                </h1>
              </div>
              <p className="text-gray-600 text-sm ml-12">
                Manage your restaurant, profile, and business settings
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="mb-8 flex flex-wrap gap-2">
          <TabButton
            isActive={activeTab === "restaurant"}
            onClick={() => setActiveTab("restaurant")}
            icon={Building2}
            label="Restaurant"
          />
          <TabButton
            isActive={activeTab === "profile"}
            onClick={() => setActiveTab("profile")}
            icon={User}
            label="Profile"
          />
          <TabButton
            isActive={activeTab === "security"}
            onClick={() => setActiveTab("security")}
            icon={Lock}
            label="Security"
          />
          <TabButton
            isActive={activeTab === "billing"}
            onClick={() => setActiveTab("billing")}
            icon={DollarSign}
            label="Billing"
          />
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Restaurant Settings */}
          {activeTab === "restaurant" && (
            <div className="space-y-6 animate-in fade-in">
              <SettingsCard title="Basic Information" icon={Store}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput
                    label="Store Name"
                    icon={Store}
                    value={settings.storeName}
                    onChange={(val) => handleSettingsChange("storeName", val)}
                    error={errors.storeName}
                  />
                  <FormInput
                    label="Phone"
                    icon={Phone}
                    value={settings.phone}
                    onChange={(val) => handleSettingsChange("phone", val)}
                    type="tel"
                    error={errors.phone}
                  />
                  <FormInput
                    label="Email"
                    icon={Mail}
                    value={settings.email}
                    onChange={(val) => handleSettingsChange("email", val)}
                    type="email"
                    error={errors.email}
                  />
                  <FormInput
                    label="Address"
                    icon={MapPin}
                    value={settings.address}
                    onChange={(val) => handleSettingsChange("address", val)}
                    error={errors.address}
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-900 mb-2">
                    <FileText
                      size={16}
                      className="inline-block mr-2 text-orange-500"
                    />
                    Description
                  </label>
                  <textarea
                    value={settings.description}
                    onChange={(e) =>
                      handleSettingsChange("description", e.target.value)
                    }
                    rows="4"
                    className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-lg text-sm font-medium resize-none bg-gray-50 focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-100 transition-all"
                    placeholder="Tell customers about your restaurant..."
                  />
                </div>
              </SettingsCard>

              <SettingsCard title="Compliance Documents" icon={FileText}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput
                    label="GST Number"
                    value={settings.gst}
                    onChange={(val) => handleSettingsChange("gst", val)}
                    help="Your GST registration number (optional)"
                  />
                  <FormInput
                    label="FSSAI License"
                    value={settings.fssai}
                    onChange={(val) => handleSettingsChange("fssai", val)}
                    help="Your FSSAI license number (optional)"
                  />
                </div>
              </SettingsCard>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={saveRestaurantSettings}
                  disabled={saving}
                  className={clsx(
                    "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
                    saving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30",
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Profile Settings */}
          {activeTab === "profile" && (
            <div className="space-y-6 animate-in fade-in">
              <SettingsCard title="Your Profile Information" icon={User}>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <FormInput
                    label="Full Name"
                    value={userSettings.name}
                    onChange={(val) => handleUserChange("name", val)}
                    error={errors.name}
                  />
                  <FormInput
                    label="Email Address"
                    icon={Mail}
                    value={userSettings.email}
                    onChange={(val) => handleUserChange("email", val)}
                    type="email"
                    error={errors.email}
                  />
                  <FormInput
                    label="Phone"
                    icon={Phone}
                    value={userSettings.phone}
                    onChange={(val) => handleUserChange("phone", val)}
                    type="tel"
                  />
                </div>
              </SettingsCard>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab("restaurant")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab("security")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={saveUserProfile}
                  disabled={saving}
                  className={clsx(
                    "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
                    saving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30",
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Update Profile
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Security Settings */}
          {activeTab === "security" && (
            <div className="space-y-6 animate-in fade-in">
              <div className="bg-red-50 border border-red-200 rounded-2xl p-4 flex gap-3">
                <AlertCircle
                  className="text-red-600 flex-shrink-0 mt-0.5"
                  size={20}
                />
                <div>
                  <h4 className="font-semibold text-red-900">
                    Security Notice
                  </h4>
                  <p className="text-sm text-red-700 mt-1">
                    {passwordRequirementsText}. Never share your password with
                    anyone.
                  </p>
                </div>
              </div>

              <SettingsCard title="Change Password" icon={Lock}>
                <div className="space-y-5">
                  <FormInput
                    label="Current Password"
                    icon={Lock}
                    value={passwords.current}
                    onChange={(val) =>
                      setPasswords((prev) => ({ ...prev, current: val }))
                    }
                    type="password"
                    error={errors.current}
                  />
                  <FormInput
                    label="New Password"
                    icon={Lock}
                    value={passwords.new}
                    onChange={(val) =>
                      setPasswords((prev) => ({ ...prev, new: val }))
                    }
                    type="password"
                    help={passwordRequirementsText}
                    error={errors.new}
                  />
                  <FormInput
                    label="Confirm Password"
                    icon={Lock}
                    value={passwords.confirm}
                    onChange={(val) =>
                      setPasswords((prev) => ({ ...prev, confirm: val }))
                    }
                    type="password"
                    help="Must match new password"
                    error={errors.confirm}
                  />
                </div>
              </SettingsCard>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab("profile")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={() => setActiveTab("billing")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all flex items-center gap-2"
                >
                  Next
                  <ChevronRight size={16} />
                </button>
                <button
                  onClick={changePassword}
                  disabled={saving}
                  className={clsx(
                    "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
                    saving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30",
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Lock size={16} />
                      Change Password
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* Billing Settings */}
          {activeTab === "billing" && (
            <div className="space-y-6 animate-in fade-in">
              <SettingsCard title="Charges & Taxes" icon={DollarSign}>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
                  <FormInput
                    label="Service Charge (%)"
                    icon={DollarSign}
                    value={settings.serviceCharge}
                    onChange={(val) =>
                      handleSettingsChange(
                        "serviceCharge",
                        parseFloat(val) || 0,
                      )
                    }
                    type="number"
                    help="Percentage of order value"
                  />
                  <FormInput
                    label="Tax Rate (%)"
                    icon={DollarSign}
                    value={settings.taxRate}
                    onChange={(val) =>
                      handleSettingsChange("taxRate", parseFloat(val) || 0)
                    }
                    type="number"
                    help="Total GST percentage"
                  />
                  <FormInput
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
              </SettingsCard>

              <SettingsCard title="Billing Summary" icon={DollarSign}>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-5 border border-blue-200 text-center">
                    <p className="text-xs font-semibold text-blue-900 mb-2">
                      Service Charge
                    </p>
                    <p className="text-3xl font-black text-blue-600">
                      {settings.serviceCharge}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-5 border border-green-200 text-center">
                    <p className="text-xs font-semibold text-green-900 mb-2">
                      Tax Rate
                    </p>
                    <p className="text-3xl font-black text-green-600">
                      {settings.taxRate}%
                    </p>
                  </div>
                  <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-5 border border-orange-200 text-center">
                    <p className="text-xs font-semibold text-orange-900 mb-2">
                      Delivery Fee
                    </p>
                    <p className="text-3xl font-black text-orange-600">
                      ₹{settings.deliveryFee}
                    </p>
                  </div>
                </div>
              </SettingsCard>

              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setActiveTab("security")}
                  className="px-6 py-2.5 rounded-lg font-semibold text-sm text-gray-700 bg-white border border-gray-200 hover:bg-gray-100 transition-all"
                >
                  Back
                </button>
                <button
                  onClick={saveRestaurantSettings}
                  disabled={saving}
                  className={clsx(
                    "px-6 py-2.5 rounded-lg font-semibold text-sm transition-all flex items-center gap-2",
                    saving
                      ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                      : "bg-gradient-to-r from-orange-500 to-orange-600 text-white hover:shadow-lg hover:shadow-orange-500/30",
                  )}
                >
                  {saving ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
