// src/api/auth.api.js
const authApi = {
  verifyInvite: {
    url: "/api/auth/invite/verify",
    method: "get",
  },

  setPassword: {
    url: "/api/auth/invite/set-password",
    method: "post",
  },
};

export default authApi;
