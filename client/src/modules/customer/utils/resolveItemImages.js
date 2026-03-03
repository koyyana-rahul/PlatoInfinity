const FALLBACK_IMAGE = "/food-placeholder.jpg";

const pickUrl = (value) => {
  if (!value) return "";
  if (typeof value === "string") return value;
  if (typeof value === "object") {
    return (
      value.url ||
      value.secure_url ||
      value.src ||
      value.path ||
      value.image ||
      ""
    );
  }
  return "";
};

export const getItemImages = (item) => {
  const all = [];

  if (Array.isArray(item?.images)) {
    for (const img of item.images) {
      const url = pickUrl(img);
      if (url) all.push(url);
    }
  }

  const primary = pickUrl(item?.image);
  if (primary) all.unshift(primary);

  const unique = [...new Set(all.filter(Boolean))];
  return unique.length ? unique : [FALLBACK_IMAGE];
};

export const getPrimaryItemImage = (item) => getItemImages(item)[0];

export const fallbackCustomerImage = (event) => {
  if (!event?.currentTarget) return;
  event.currentTarget.onerror = null;
  event.currentTarget.src = FALLBACK_IMAGE;
};
