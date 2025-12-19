import React, { useEffect } from "react";
import { useParams, Outlet, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";

const BrandShell = () => {
  const { brandSlug } = useParams();
  const navigate = useNavigate();
  const user = useSelector((state) => state.user); // Assuming user state has brandId and role

  useEffect(() => {
    // Basic check: if user is logged in and brandId doesn't match brandSlug,
    // or if user doesn't have a brandId and we are on a brandSlug route,
    // we might need to redirect. This is a very simplistic check.
    if (user._id && !user.brandId && brandSlug) {
      // User is logged in but has no brand, but somehow landed on a brand-specific URL.
      // Could redirect to onboarding or a general error page.
      navigate("/onboarding/create-brand", { replace: true });
    } else if (user._id && user.brandId && brandSlug !== user.brandId) {
      // User is logged in, has a brand, but the URL brandSlug doesn't match their brand.
      // This implies an attempt to access another brand's data.
      // Could redirect to their own brand's dashboard or an unauthorized page.
      // For now, let's redirect to their own brand's root path.
      // This logic will need to be refined with actual brand slug comparison (user.brandSlug vs brandSlug)
      // For now, assuming user.brandId can be used for redirection.
      // If brandId is an ID, and brandSlug is a name, more logic is needed to resolve.
      // For demonstration, let's assume brandId can be used for redirection.
      // navigate(`/${user.brandId}/dashboard`, { replace: true });
      // TODO: Implement proper brand slug validation and redirection
    }

    // In a real application, you would fetch brand-specific data (theme, logo, etc.) here
    // based on the brandSlug.
    console.log(`BrandShell loaded for brand: ${brandSlug}`);
  }, [brandSlug, user, navigate]);

  // Here, you would implement the "Authorizer" and "The Render" logic
  // based on the user's role and the brandSlug.
  // For now, we'll just render an Outlet for nested routes.
  return (
    <div className="brand-shell-container">
      <header className="brand-header bg-blue-600 text-white p-4">
        <h1 className="text-xl">Brand: {brandSlug}</h1>
        {/* Potentially display brand logo, name, etc. here */}
      </header>
      <main className="brand-content">
        <Outlet /> {/* This is where role-specific components will render */}
      </main>
    </div>
  );
};

export default BrandShell;
