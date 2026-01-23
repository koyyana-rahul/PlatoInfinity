const generateFrontendUrl = (path) => {
  const baseUrl = process.env.FRONTEND_URL || "https://platoinfinity.xyz";
  return `${baseUrl}${path}`;
};

export default generateFrontendUrl;
