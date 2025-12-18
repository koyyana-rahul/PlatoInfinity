const isAdmin = (s) => {
  if (s === "BRAND_ADMIN") {
    return true;
  }

  return false;
};

export default isAdmin;
