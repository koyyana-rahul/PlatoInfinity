const generateFrontendUrl = (path = "") => {
  const rawBaseUrl = process.env.FRONTEND_URL || "https://platoinfinity.xyz";

  // Be resilient to accidental spaces/quotes in .env values
  const baseUrl = String(rawBaseUrl)
    .trim()
    .replace(/^['"]|['"]$/g, "")
    .replace(/\/+$/, "");

  const normalizedPath = String(path).startsWith("/") ? path : `/${path}`;

  return `${baseUrl}${normalizedPath}`;
};

export default generateFrontendUrl;
