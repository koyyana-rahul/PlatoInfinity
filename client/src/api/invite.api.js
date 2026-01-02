// src/api/invite.api.js

const inviteApi = {
  inviteManager: (restaurantId) => ({
    url: `/api/restaurants/${restaurantId}/managers/invite`,
    method: "post",
  }),
};

export default inviteApi;