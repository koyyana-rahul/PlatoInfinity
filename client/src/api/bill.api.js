const billApi = {
  generateBySession: (sessionId) => ({
    url: `/api/bill/session/${sessionId}`,
    method: "POST",
  }),

  getBySession: (sessionId) => ({
    url: `/api/bill/session/${sessionId}`,
    method: "GET",
  }),

  pay: (billId) => ({
    url: `/api/bill/${billId}/pay`,
    method: "POST",
  }),
};

export default billApi;
