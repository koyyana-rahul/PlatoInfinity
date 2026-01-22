/**
 * DIAGNOSTIC SCRIPT - Run in Browser Console
 *
 * Purpose: Understand token flow and debug 401 errors
 */

console.log("=".repeat(60));
console.log("🔍 PLATO SESSION AUTHENTICATION DIAGNOSTIC");
console.log("=".repeat(60));

// 1. Check localStorage
console.log("\n📦 STEP 1: Check localStorage for session token");
const sessionKeys = Object.keys(localStorage).filter((k) =>
  k.includes("customerSession"),
);
console.log("Session keys found:", sessionKeys.length);
sessionKeys.forEach((key) => {
  const token = localStorage.getItem(key);
  console.log(`  ├─ ${key}`);
  console.log(`  │  Value: ${token?.substring(0, 20)}...`);
  console.log(`  │  Length: ${token?.length} chars`);
  console.log(
    `  │  Type: ${token?.length === 24 ? "ObjectId (OLD)" : token?.length === 64 ? "Crypto Token (NEW)" : "Unknown"}`,
  );
});

if (sessionKeys.length === 0) {
  console.warn("⚠️  No session token in localStorage!");
  console.warn("   Action: Join a table with PIN first");
}

// 2. Check request headers
console.log("\n📤 STEP 2: Check what's being sent in requests");
console.log("Make a request and check Network tab:");
console.log("  1. Open DevTools (F12)");
console.log("  2. Go to Network tab");
console.log("  3. Make any /api/cart or /api/order request");
console.log("  4. Click on the request");
console.log("  5. Go to 'Request Headers'");
console.log("  6. Look for 'x-customer-session' header");
console.log("  7. Value should match token above");

// 3. Server expectations
console.log("\n🖥️  STEP 3: Server middleware logic");
console.log("Middleware checks tokens in this order:");
console.log("  1️⃣  Is it 24 chars (ObjectId)?");
console.log("      └─ Yes: Look up session by _id directly");
console.log("  2️⃣  Is it 64 chars (crypto)?");
console.log("      └─ Hash it, then check:");
console.log("         a) customerTokens array (NEW format)");
console.log("         b) sessionTokenHash field (OLD format)");

// 4. Token length analysis
console.log("\n🔎 STEP 4: Analyze token type");
if (sessionKeys.length > 0) {
  const token = localStorage.getItem(sessionKeys[0]);
  console.log(`Current token: ${token}`);
  console.log(`Length: ${token.length}`);

  if (token.length === 24) {
    console.log("✅ Token is ObjectId format");
    console.log("   → Server returning sessionId");
    console.log("   → Middleware will look it up directly");
    console.log("   → Should work for sessions opened by staff");
  } else if (token.length === 64) {
    console.log("✅ Token is crypto format (new)");
    console.log("   → Will be hashed and checked in customerTokens");
    console.log("   → Should work for PIN-joined sessions");
  } else {
    console.log("❌ Token is unknown format");
    console.log("   → May not work correctly");
  }
}

// 5. Network tab helper
console.log("\n🌐 STEP 5: Simulate request");
console.log("Try running this in console:");
console.log(`
const token = localStorage.getItem('${sessionKeys[0] || "plato:customerSession:xxx"}');
fetch('/api/cart', {
  method: 'GET',
  headers: {
    'x-customer-session': token
  }
}).then(r => r.json()).then(d => console.log('Response:', d));
`);

// 6. Summary
console.log("\n" + "=".repeat(60));
console.log("📋 SUMMARY");
console.log("=".repeat(60));
if (sessionKeys.length === 0) {
  console.warn("❌ No session - join a table first");
} else {
  const token = localStorage.getItem(sessionKeys[0]);
  if (token.length === 24) {
    console.log("✅ Token stored as ObjectId");
    console.log("   Status: Should work with current middleware fix");
  } else if (token.length === 64) {
    console.log("✅ Token stored as crypto string");
    console.log("   Status: Should work if server has new code");
  }
}

console.log("\nNext steps:");
console.log("1. Check Network tab while making cart request");
console.log("2. Look for x-customer-session header in request");
console.log("3. Check server console for middleware logs");
console.log("4. If 401 still occurs, share server logs");
console.log("=".repeat(60));
