// src/api/cashier.api.js

const cashierApi = {
  // Get pending bills
  getPendingBills: {
    url: "/api/cashier/bills",
    method: "GET",
  },

  // Get bill details
  getBillDetail: (billId) => ({
    url: `/api/cashier/bills/${billId}`,
    method: "GET",
  }),

  // Process single payment
  processBillPayment: (billId) => ({
    url: `/api/cashier/bills/${billId}/pay`,
    method: "POST",
  }),

  // Process split payment (multiple methods)
  splitBillPayment: (billId) => ({
    url: `/api/cashier/bills/${billId}/split`,
    method: "POST",
  }),

  // Get cashier summary/dashboard
  getSummary: {
    url: "/api/cashier/summary",
    method: "GET",
  },

  // Get payment history
  getPaymentHistory: {
    url: "/api/cashier/history",
    method: "GET",
  },
};

export default cashierApi;
