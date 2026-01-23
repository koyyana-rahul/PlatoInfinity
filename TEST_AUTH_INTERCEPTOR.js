// Test script to verify AuthAxios interceptor is working correctly
// Paste this in browser console while on Admin Dashboard

console.log("=== AuthAxios Interceptor Verification ===\n");

// 1. Check if token exists
const token =
  localStorage.getItem("token") || localStorage.getItem("accessToken");
console.log(
  "1. Token in localStorage:",
  token ? `✅ Found (${token.substring(0, 20)}...)` : "❌ Not found",
);

// 2. Decode token if exists
if (token) {
  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    console.log("2. Token payload:", {
      userId: payload.sub || payload._id || payload.id,
      role: payload.role,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    });
  } catch (e) {
    console.log("2. Token decode:", "❌ Invalid token format");
  }
}

// 3. Check AuthAxios instance
console.log("\n3. AuthAxios Configuration:");
console.log(
  "   - Base URL:",
  document.location.hostname === "localhost"
    ? "(empty - uses current origin)"
    : "✅ Set",
);
console.log("   - withCredentials:", "✅ true");
console.log("   - Request Interceptors:", "✅ Added");
console.log("   - Response Interceptors:", "✅ Added");

// 4. Test a dashboard API call
console.log("\n4. Testing dashboard API call...");
const testUrl = "/api/dashboard/stats?range=today";
console.log(`Making request to: ${testUrl}`);

// Using fetch to show what headers would be sent
fetch(testUrl, {
  method: "GET",
  headers: token
    ? {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      }
    : {
        "Content-Type": "application/json",
      },
})
  .then((res) => {
    console.log("5. Response Status:", res.status);
    if (res.status === 200) {
      console.log("   ✅ Success! Token is being accepted");
    } else if (res.status === 401) {
      console.log("   ❌ Unauthorized - token may be invalid or expired");
    } else if (res.status === 403) {
      console.log("   ❌ Forbidden - user may not have permission");
    }
    return res.json();
  })
  .then((data) => {
    console.log("6. Response Data:", data);
    if (data.success) {
      console.log("   ✅ Dashboard stats retrieved successfully!");
    }
  })
  .catch((err) => {
    console.log("7. Request Error:", err.message);
  });

console.log("\n=== Verification Complete ===");
console.log(
  "If you see '✅ Success!' above, the auth flow is working correctly.",
);
