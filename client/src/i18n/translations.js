/**
 * I18N CONFIGURATION
 * Hindi & English localization for Plato Menu
 * Includes all customer-facing and staff texts
 */

export const translations = {
  en: {
    // Customer App
    "customer.menu.title": "Plato Menu",
    "customer.menu.subtitle": "Scan to order, pay when ready",
    "customer.menu.cart": "Your Cart",
    "customer.menu.empty": "Start adding items",
    "customer.menu.total": "Total",
    "customer.menu.callWaiter": "Call Waiter for PIN",
    "customer.menu.browseItems": "Browse our menu",
    "customer.menu.spiceLevel": "Spice Level",
    "customer.menu.noOnion": "No Onion",
    "customer.menu.jain": "Jain (No Onion/Garlic)",
    "customer.menu.specialRequests": "Special Requests",
    "customer.menu.notes": "E.g., less salt, extra side...",
    "customer.menu.quantity": "Quantity",
    "customer.menu.addToCart": "Add to Cart",
    "customer.menu.removeFromCart": "Item removed",
    "customer.order.pinRequired": "Enter the 4-digit PIN given by your waiter:",
    "customer.order.customerLabel":
      "For individual billing, please provide a label",
    "customer.order.placedSuccess": "Order placed! Watch for updates below 👇",
    "customer.order.status": "Order Status",
    "customer.order.pending": "🟡 Preparing",
    "customer.order.ready": "🟢 Ready for Pickup",
    "customer.order.served": "✅ Served",

    // Waiter App
    "waiter.login.title": "Plato Menu",
    "waiter.login.subtitle": "Waiter Staff Login",
    "waiter.login.staffCode": "Staff Code",
    "waiter.login.pin": "4-Digit PIN",
    "waiter.login.signIn": "Sign In",
    "waiter.dashboard.tables": "Tables",
    "waiter.dashboard.status": "Status",
    "waiter.dashboard.occupied": "🔴 Occupied",
    "waiter.dashboard.available": "🟢 Available",
    "waiter.cart.review": "Cart Review",
    "waiter.cart.approve": "✅ Approve & Show PIN",
    "waiter.cart.approved": "Cart Approved! ✅",
    "waiter.cart.showPin": "Show this PIN to the customer",
    "waiter.cart.pinShown": "✓ PIN Shown → Continue",
    "waiter.ready.notification": "🟢 Ready for pickup: {itemName}",

    // Chef App
    "chef.login.title": "Kitchen",
    "chef.login.subtitle": "Chef Station Login",
    "chef.dashboard.newOrder": "🔥 NEW ORDER!",
    "chef.dashboard.pending": "Pending",
    "chef.dashboard.cooking": "🔥 COOKING",
    "chef.dashboard.new": "🆕 NEW",
    "chef.item.startCooking": "Start Cooking",
    "chef.item.markReady": "Mark Ready",
    "chef.item.confirmPin": "Confirm with PIN when ready:",
    "chef.notification.allCaughtUp": "All caught up! ✓",
    "chef.notification.noNewOrders": "New orders will appear here",
    "chef.item.readyNotif": "✅ Item marked as READY!",

    // Cashier App
    "cashier.login.title": "Payment Counter",
    "cashier.login.subtitle": "Cashier Staff Login",
    "cashier.counter.title": "💳 Payment Counter",
    "cashier.bills.open": "📋 Open Bills",
    "cashier.bills.empty": "No open bills",
    "cashier.bill.items": "items",
    "cashier.bill.selectBill": "Select a bill to process payment",
    "cashier.payment.method": "Payment Method",
    "cashier.payment.cash": "💵 Cash",
    "cashier.payment.upi": "📱 UPI",
    "cashier.payment.amountReceived": "Amount Received (₹):",
    "cashier.payment.change": "Change",
    "cashier.payment.shareViaWhatsapp": "Share Bill via WhatsApp:",
    "cashier.payment.phone": "Customer phone (10 digits)",
    "cashier.payment.process": "Process Payment",
    "cashier.payment.success": "Payment processed!",
    "cashier.bill.sent": "Bill sent via WhatsApp!",

    // Manager Dashboard
    "manager.dashboard.title": "📊 Restaurant Dashboard",
    "manager.dashboard.subtitle": "Real-time analytics and management",
    "manager.overview.tab": "Overview",
    "manager.fraud.tab": "Fraud Alerts",
    "manager.kitchen.tab": "Kitchen",
    "manager.staff.tab": "Staff",
    "manager.metrics.revenue": "Total Revenue",
    "manager.metrics.orders": "Orders",
    "manager.metrics.avgOrderValue": "Avg Order Value",
    "manager.metrics.activeTables": "Active Tables",
    "manager.fraud.allClear": "All Clear!",
    "manager.fraud.noSuspicious": "No suspicious orders detected",
    "manager.fraud.riskScore": "Risk",
    "manager.fraud.approve": "Approve",
    "manager.fraud.reject": "Reject",
    "manager.kitchen.pending": "Pending",
    "manager.kitchen.inProgress": "In Progress",
    "manager.kitchen.avgWaitTime": "Avg Wait Time",
    "manager.staff.onDuty": "On Duty",
    "manager.staff.off": "Off",

    // Admin Dashboard
    "admin.title": "Brand Admin Dashboard",
    "admin.subtitle": "Multi-branch overview & analytics",
    "admin.overview.tab": "Overview",
    "admin.branches.tab": "Branches",
    "admin.menu.tab": "Master Menu",
    "admin.fraud.tab": "Fraud AI",
    "admin.staff.tab": "Staff",
    "admin.chainRevenue": "Chain Revenue",
    "admin.totalOrders": "Total Orders",
    "admin.activeBranches": "Active Branches",
    "admin.avgOrderValue": "Avg Order Value",
    "admin.revenueByBranch": "Revenue by Branch",
    "admin.addBranch": "+ Add New Branch",

    // Common
    "common.logout": "Logout",
    "common.loading": "Loading...",
    "common.error": "Error",
    "common.success": "Success",
    "common.cancel": "Cancel",
    "common.save": "Save",
    "common.delete": "Delete",
    "common.edit": "Edit",
    "common.view": "View",
    "common.back": "Back",
    "common.home": "Home",
    "common.search": "Search",
    "common.noData": "No data found",
    "common.invalidInput": "Invalid input",
    "common.required": "This field is required",
  },

  hi: {
    // Customer App
    "customer.menu.title": "प्लेटो मेनू",
    "customer.menu.subtitle": "स्कैन करें, ऑर्डर करें, आसानी से भुगतान करें",
    "customer.menu.cart": "आपकी कार्ट",
    "customer.menu.empty": "खरीदारी शुरू करें",
    "customer.menu.total": "कुल",
    "customer.menu.callWaiter": "PIN के लिए वेटर को बुलाएं",
    "customer.menu.browseItems": "हमारा मेनू देखें",
    "customer.menu.spiceLevel": "मसाले का स्तर",
    "customer.menu.noOnion": "प्याज न डालें",
    "customer.menu.jain": "जैन (प्याज/लहसुन न डालें)",
    "customer.menu.specialRequests": "विशेष अनुरोध",
    "customer.menu.notes": "जैसे, कम नमक, अतिरिक्त पक्ष...",
    "customer.menu.quantity": "मात्रा",
    "customer.menu.addToCart": "कार्ट में जोड़ें",
    "customer.menu.removeFromCart": "आइटम हटा दिया गया",
    "customer.order.pinRequired":
      "अपने वेटर द्वारा दिए गए 4-अंकीय PIN को दर्ज करें:",
    "customer.order.customerLabel":
      "व्यक्तिगत बिलिंग के लिए, कृपया एक लेबल प्रदान करें",
    "customer.order.placedSuccess": "ऑर्डर दिया गया! नीचे अपडेट देखें 👇",
    "customer.order.status": "ऑर्डर स्थिति",
    "customer.order.pending": "🟡 तैयारी",
    "customer.order.ready": "🟢 पिकअप के लिए तैयार",
    "customer.order.served": "✅ परोसा गया",

    // Waiter App
    "waiter.login.title": "प्लेटो मेनू",
    "waiter.login.subtitle": "वेटर कर्मचारी लॉगिन",
    "waiter.login.staffCode": "कर्मचारी कोड",
    "waiter.login.pin": "4-अंकीय PIN",
    "waiter.login.signIn": "साइन इन करें",
    "waiter.dashboard.tables": "टेबल्स",
    "waiter.dashboard.status": "स्थिति",
    "waiter.dashboard.occupied": "🔴 व्यस्त",
    "waiter.dashboard.available": "🟢 उपलब्ध",
    "waiter.cart.review": "कार्ट समीक्षा",
    "waiter.cart.approve": "✅ मंजूरी दें और PIN दिखाएं",
    "waiter.cart.approved": "कार्ट मंजूर! ✅",
    "waiter.cart.showPin": "ग्राहक को यह PIN दिखाएं",
    "waiter.cart.pinShown": "✓ PIN दिखाया गया → जारी रखें",
    "waiter.ready.notification": "🟢 पिकअप के लिए तैयार: {itemName}",

    // Chef App
    "chef.login.title": "किचन",
    "chef.login.subtitle": "शेफ स्टेशन लॉगिन",
    "chef.dashboard.newOrder": "🔥 नया ऑर्डर!",
    "chef.dashboard.pending": "लंबित",
    "chef.dashboard.cooking": "🔥 पकाया जा रहा है",
    "chef.dashboard.new": "🆕 नया",
    "chef.item.startCooking": "खाना पकाना शुरू करें",
    "chef.item.markReady": "तैयार चिह्नित करें",
    "chef.item.confirmPin": "तैयार होने पर PIN से पुष्टि करें:",
    "chef.notification.allCaughtUp": "सब कुछ पूरा हो गया! ✓",
    "chef.notification.noNewOrders": "नए ऑर्डर यहाँ दिखाई देंगे",
    "chef.item.readyNotif": "✅ आइटम तैयार चिह्नित!",

    // Cashier App
    "cashier.login.title": "पेमेंट काउंटर",
    "cashier.login.subtitle": "कैशियर कर्मचारी लॉगिन",
    "cashier.counter.title": "💳 पेमेंट काउंटर",
    "cashier.bills.open": "📋 खुले बिल",
    "cashier.bills.empty": "कोई खुला बिल नहीं",
    "cashier.bill.items": "आइटम्स",
    "cashier.bill.selectBill": "भुगतान संसाधित करने के लिए एक बिल चुनें",
    "cashier.payment.method": "भुगतान विधि",
    "cashier.payment.cash": "💵 नकद",
    "cashier.payment.upi": "📱 UPI",
    "cashier.payment.amountReceived": "प्राप्त राशि (₹):",
    "cashier.payment.change": "बाकी",
    "cashier.payment.shareViaWhatsapp": "WhatsApp के माध्यम से बिल साझा करें:",
    "cashier.payment.phone": "ग्राहक फोन (10 अंक)",
    "cashier.payment.process": "भुगतान संसाधित करें",
    "cashier.payment.success": "भुगतान संसाधित!",
    "cashier.bill.sent": "बिल WhatsApp के माध्यम से भेजा गया!",

    // Manager Dashboard
    "manager.dashboard.title": "📊 रेस्तरां डैशबोर्ड",
    "manager.dashboard.subtitle": "रीयल-टाइम विश्लेषण और प्रबंधन",
    "manager.overview.tab": "अवलोकन",
    "manager.fraud.tab": "धोखाधड़ी सतर्कताएं",
    "manager.kitchen.tab": "किचन",
    "manager.staff.tab": "कर्मचारी",
    "manager.metrics.revenue": "कुल राजस्व",
    "manager.metrics.orders": "ऑर्डर",
    "manager.metrics.avgOrderValue": "औसत ऑर्डर मूल्य",
    "manager.metrics.activeTables": "सक्रिय टेबल्स",
    "manager.fraud.allClear": "सब ठीक है!",
    "manager.fraud.noSuspicious": "कोई संदिग्ध ऑर्डर नहीं पाया गया",
    "manager.fraud.riskScore": "जोखिम",
    "manager.fraud.approve": "मंजूरी दें",
    "manager.fraud.reject": "अस्वीकार करें",
    "manager.kitchen.pending": "लंबित",
    "manager.kitchen.inProgress": "प्रक्रिया में",
    "manager.kitchen.avgWaitTime": "औसत प्रतीक्षा समय",
    "manager.staff.onDuty": "ड्यूटी पर",
    "manager.staff.off": "बंद",

    // Admin Dashboard
    "admin.title": "ब्रांड एडमिन डैशबोर्ड",
    "admin.subtitle": "बहु-शाखा अवलोकन और विश्लेषण",
    "admin.overview.tab": "अवलोकन",
    "admin.branches.tab": "शाखाएं",
    "admin.menu.tab": "मास्टर मेनू",
    "admin.fraud.tab": "धोखाधड़ी AI",
    "admin.staff.tab": "कर्मचारी",
    "admin.chainRevenue": "चेन राजस्व",
    "admin.totalOrders": "कुल ऑर्डर",
    "admin.activeBranches": "सक्रिय शाखाएं",
    "admin.avgOrderValue": "औसत ऑर्डर मूल्य",
    "admin.revenueByBranch": "शाखा द्वारा राजस्व",
    "admin.addBranch": "+ नई शाखा जोड़ें",

    // Common
    "common.logout": "लॉगआउट",
    "common.loading": "लोड हो रहा है...",
    "common.error": "त्रुटि",
    "common.success": "सफलता",
    "common.cancel": "रद्द करें",
    "common.save": "बचाएं",
    "common.delete": "हटाएं",
    "common.edit": "संपादित करें",
    "common.view": "देखें",
    "common.back": "वापस",
    "common.home": "होम",
    "common.search": "खोज",
    "common.noData": "कोई डेटा नहीं मिला",
    "common.invalidInput": "अमान्य इनपुट",
    "common.required": "यह फील्ड आवश्यक है",
  },
};

/**
 * I18n Hook for React
 * Usage: const t = useI18n(); then t('key.name')
 */
export function useI18n(language = "en") {
  return (key, params = {}) => {
    let text = translations[language]?.[key] || key;

    // Replace parameters
    Object.entries(params).forEach(([param, value]) => {
      text = text.replace(`{${param}}`, value);
    });

    return text;
  };
}

/**
 * Get language from localStorage or default
 */
export function getLanguage() {
  return localStorage.getItem("plato_language") || "en";
}

/**
 * Set language and persist
 */
export function setLanguage(lang) {
  localStorage.setItem("plato_language", lang);
  window.location.reload(); // Refresh to apply new language
}

/**
 * Translate JSON object recursively
 * Useful for API responses
 */
export function translateObject(obj, language = "en") {
  const t = useI18n(language);

  if (typeof obj === "string") {
    return t(obj);
  }

  if (Array.isArray(obj)) {
    return obj.map((item) => translateObject(item, language));
  }

  if (typeof obj === "object" && obj !== null) {
    const translated = {};
    for (const [key, value] of Object.entries(obj)) {
      translated[key] = translateObject(value, language);
    }
    return translated;
  }

  return obj;
}
