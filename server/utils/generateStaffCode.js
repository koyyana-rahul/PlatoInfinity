export async function generateStaffCode(UserModel, restaurantId, role) {
  const map = {
    WAITER: "WT",
    CHEF: "CH",
    CASHIER: "CS",
  };

  const prefix = map[role];
  const count = await UserModel.countDocuments({ restaurantId, role });

  return `${prefix}-${String(count + 1).padStart(2, "0")}`;
}
