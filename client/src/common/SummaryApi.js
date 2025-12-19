export const baseURL =
  (import.meta.env.VITE_API_BASE_URL &&
    import.meta.env.VITE_API_BASE_URL.replace("https", "http")) ||
  "http://localhost:8080/api";

const SummaryApi = {
  register: {
    url: "/auth/register",
    method: "post",
  },
  verifyEmail: {
    url: "/auth/verify-email",
    method: "post",
  },
  login: {
    url: "/auth/login",
    method: "post",
  },
  refreshToken: {
    url: "/auth/refresh-token",
    method: "post",
  },

  forgotPassword: {
    url: "/auth/forgot-password",
    method: "post",
  },
  forgot_password_otp_verification: {
    url: "/auth/verify-forgot-otp",
    method: "post",
  },
  resetPassword: {
    url: "/auth/reset-password",
    method: "post",
  },

  logout: {
    url: "/auth/logout",
    method: "post",
  },
  uploadAvatar: {
    url: "/auth/upload-avatar",
    method: "post",
  },

  updateProfile: {
    url: "/auth/update-profile",
    method: "put",
  },
  userDetails: {
    url: "/auth/me",
    method: "get",
  },
  createBrand: {
    url: "/brand",
    method: "post",
  },
  getBrandDetails: {
    url: "/brand",
    method: "get",
  },
};

export default SummaryApi;
