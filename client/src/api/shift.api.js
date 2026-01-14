// src/api/shift.api.js

const shiftApi = {
  open: {
    url: "/api/shifts/open",
    method: "POST",
  },

  refreshQr: {
    url: "/api/shifts/refresh-qr",
    method: "POST",
  },

  close: {
    url: "/api/shifts/close",
    method: "POST",
  },

  active: {
    url: "/api/shifts/active",
    method: "GET",
  },
};

export default shiftApi;
