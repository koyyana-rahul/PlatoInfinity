// Test script to check cookie auth flow
// Run this in browser console after logging in

console.log("=== Cookie Auth Diagnosis ===\n");

// 1. Check if cookies exist
console.log("1. Cookies in browser:");
const cookies = document.cookie;
console.log("   document.cookie:", cookies || "(empty)");

// 2. Try to access cookies via document
if (document.cookie.includes("accessToken")) {
  console.log("   ✅ accessToken found in document.cookie");
} else {
  console.log(
    "   ❌ accessToken NOT in document.cookie (httpOnly cookies won't appear here)",
  );
}

// 3. Check what withCredentials should do
console.log("\n2. Axios withCredentials:");
console.log("   AuthAxios.defaults.withCredentials:", true);
console.log("   This should send cookies with all requests");

// 4. Make a test request to see headers
console.log("\n3. Testing request with AuthAxios:");
const testRequest = async () => {
  try {
    const response = await fetch("/api/dashboard/stats?range=today", {
      method: "GET",
      credentials: "include", // This is equivalent to withCredentials: true
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log("   Status:", response.status);
    console.log("   Headers sent:");

    // Can't see cookies sent (httpOnly), but we can see if we got 403
    if (response.status === 403) {
      console.log(
        "   ❌ Still getting 403 - cookies not being sent or not valid",
      );
    } else if (response.status === 401) {
      console.log("   ❌ Getting 401 - token missing or invalid");
    } else if (response.status === 200) {
      console.log("   ✅ Success! Request worked");
      const data = await response.json();
      console.log("   Data:", data);
    }

    return response;
  } catch (err) {
    console.error("   ❌ Request error:", err.message);
  }
};

await testRequest();

console.log("\n4. Check login response:");
console.log("   Look in Network tab → Login request → Response Headers");
console.log(
  "   Should see: Set-Cookie: accessToken=...; Set-Cookie: refreshToken=...",
);

console.log("\n=== End Diagnosis ===");
console.log("\nNext steps:");
console.log("1. Check server logs to see what cookies requireAuth receives");
console.log(
  "2. Check Network tab to see if cookies are being sent in requests",
);
console.log("3. Check if login response has Set-Cookie headers");
