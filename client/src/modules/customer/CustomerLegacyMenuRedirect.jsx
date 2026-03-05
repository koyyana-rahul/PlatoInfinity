import { Navigate, useParams } from "react-router-dom";

export default function CustomerLegacyMenuRedirect() {
  const { brandSlug, restaurantSlug, tableId } = useParams();

  return (
    <Navigate
      replace
      to={`/${brandSlug}/${restaurantSlug}/table/${tableId}/menu`}
    />
  );
}
