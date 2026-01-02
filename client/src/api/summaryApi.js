const SummaryApi = {
  // AUTH
  register: {
    url: "/api/auth/register",
    method: "post",
  },
  verifyEmail: {
    url: "/api/auth/verify-email",
    method: "post",
  },
  login: {
    url: "/api/auth/login",
    method: "post",
  },
  logout: {
    url: "/api/auth/logout",
    method: "post",
  },
  refreshToken: {
    url: "/api/auth/refresh-token",
    method: "post",
  },
  forgotPassword: {
    url: "/api/auth/forgot-password",
    method: "post",
  },
  verifyForgotOtp: {
    url: "/api/auth/verify-forgot-otp",
    method: "post",
  },
  resetPassword: {
    url: "/api/auth/reset-password",
    method: "post",
  },
  me: {
    url: "/api/auth/me",
    method: "get",
  },
};

export default SummaryApi;
