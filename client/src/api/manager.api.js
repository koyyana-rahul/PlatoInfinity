const managerApi = {
  inviteManager: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/managers/invite`,
    method: "POST",
  }),
  resendInvite: (restaurantId, managerId) => ({
    url: `/api/restaurants/${restaurantId}/managers/${managerId}/resend-invite`,
    method: "post",
  }),

  removeManager: (restaurantId, managerId) => ({
    url: `/api/restaurants/${restaurantId}/managers/${managerId}`,
    method: "delete",
  }),
};
export default managerApi;
