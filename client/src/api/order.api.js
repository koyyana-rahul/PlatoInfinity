const orderApi = {
  listSessionOrdersStaff: (sessionId) => ({
    url: `/api/order/session/${sessionId}/staff`,
    method: "GET",
  }),
};

export default orderApi;
