import bcryptjs from "bcryptjs";

/**
 * Hash a 4-digit staff PIN using bcryptjs
 * @param {string} plainPin - 4-digit PIN (e.g., "1234")
 * @returns {Promise<string>} - Hashed PIN
 */
export async function hashStaffPin(plainPin) {
  if (!plainPin || String(plainPin).length !== 4) {
    throw new Error("PIN must be exactly 4 digits");
  }
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(plainPin, salt);
}

/**
 * Verify a plain PIN against a hashed PIN
 * @param {string} plainPin - Plain 4-digit PIN from user input
 * @param {string} hashedPin - Hashed PIN from database
 * @returns {Promise<boolean>} - True if PIN matches
 */
export async function verifyStaffPin(plainPin, hashedPin) {
  if (!plainPin || !hashedPin) {
    return false;
  }
  return bcryptjs.compare(plainPin, hashedPin);
}

/**
 * Generate a random 4-digit PIN
 * @returns {string} - 4-digit PIN as string
 */
export function generateRandomPin() {
  return String(Math.floor(1000 + Math.random() * 9000));
}
