// src/middleware/requireRole.js

/**
 * requireRole(...allowedRoles)
 * Example: requireRole('BRAND_ADMIN'), requireRole('MANAGER','BRAND_ADMIN')
 */
export function requireRole(...allowedRoles) {
  return (req, res, next) => {
    try {
      console.log("\n========== 🚫 requireRole CHECK ==========");
      console.log("Allowed roles:", allowedRoles);
      console.log("User object:", req.user);
      console.log("User role:", req.user?.role || "❌ NO ROLE");
      console.log("=========================================\n");

      const user = req.user;
      if (!user)
        return res
          .status(401)
          .json({ message: "Unauthorized", error: true, success: false });
      if (!allowedRoles.includes(user.role)) {
        console.error(
          `❌ ROLE REJECTED: User role '${user.role}' not in [${allowedRoles.join(", ")}]`,
        );
        return res.status(403).json({
          message: "Forbidden - insufficient role",
          error: true,
          success: false,
        });
      }
      return next();
    } catch (err) {
      console.error("requireRole error:", err);
      return res
        .status(500)
        .json({ message: "Server error", error: true, success: false });
    }
  };
}
