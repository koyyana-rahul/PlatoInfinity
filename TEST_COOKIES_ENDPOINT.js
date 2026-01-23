// Quick test to understand cookie issue
// Add this to server/index.js temporarily

app.get("/api/test/cookies", (req, res) => {
  console.log("=== TEST COOKIES ENDPOINT ===");
  console.log("Cookies received:");
  console.log("  req.cookies:", req.cookies);
  console.log("  req.headers.cookie:", req.headers.cookie);

  return res.json({
    success: true,
    cookies: req.cookies,
    rawCookie: req.headers.cookie,
    message: "Check server logs above",
  });
});

// Add this BEFORE the routes section
// Then test with: http://localhost:8080/api/test/cookies
// And from frontend: fetch('/api/test/cookies', { credentials: 'include' })
