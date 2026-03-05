/**
 * sessionManager.js
 * Manages customer session, table PIN, and session state
 */

const SESSION_STORAGE_KEY = "plato:customerSession";
const PIN_STORAGE_KEY = "plato:customerPin";
const DEVICE_ID_KEY = "plato:deviceId";
const TABLE_KEY = "plato:lastTableId";

export const sessionManager = {
  /**
   * Initialize or get device ID
   */
  getDeviceId() {
    let deviceId = localStorage.getItem(DEVICE_ID_KEY);
    if (!deviceId) {
      deviceId = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
      localStorage.setItem(DEVICE_ID_KEY, deviceId);
    }
    return deviceId;
  },

  /**
   * Get session from storage
   */
  getSession(tableId) {
    const key = `${SESSION_STORAGE_KEY}:${tableId}`;
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : null;
  },

  /**
   * Save session to storage
   */
  setSession(tableId, sessionData) {
    const key = `${SESSION_STORAGE_KEY}:${tableId}`;
    localStorage.setItem(key, JSON.stringify(sessionData));
    localStorage.setItem(TABLE_KEY, tableId);
  },

  /**
   * Save table PIN
   */
  setTablePin(tableId, pin) {
    const key = `${PIN_STORAGE_KEY}:${tableId}`;
    localStorage.setItem(key, pin);
  },

  /**
   * Get table PIN
   */
  getTablePin(tableId) {
    const key = `${PIN_STORAGE_KEY}:${tableId}`;
    return localStorage.getItem(key);
  },

  /**
   * Clear session for table
   */
  clearSession(tableId) {
    const sessionKey = `${SESSION_STORAGE_KEY}:${tableId}`;
    const pinKey = `${PIN_STORAGE_KEY}:${tableId}`;
    localStorage.removeItem(sessionKey);
    localStorage.removeItem(pinKey);
  },

  /**
   * Check if session is valid
   */
  isSessionValid(tableId) {
    const session = this.getSession(tableId);
    if (!session || !session.sessionId) return false;

    // Optional: Check expiry
    const expiry = session.expiryTime;
    if (expiry && new Date(expiry) < new Date()) {
      this.clearSession(tableId);
      return false;
    }
    return true;
  },

  /**
   * Get last accessed table ID
   */
  getLastTableId() {
    return localStorage.getItem(TABLE_KEY);
  },

  /**
   * Generate idempotency key for order
   */
  generateIdempotencyKey() {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
  },
};

export default sessionManager;
