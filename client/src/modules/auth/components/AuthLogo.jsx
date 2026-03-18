import { useState } from "react";
import { ShieldAlert } from "lucide-react";

export default function AuthLogo({
  className = "",
  sizeClass = "h-14 w-14",
  iconSize = 28,
}) {
  const [logoLoadError, setLogoLoadError] = useState(false);

  if (logoLoadError) {
    return (
      <div
        className={`inline-flex items-center justify-center ${sizeClass} rounded-xl bg-gradient-to-br from-[#FC8019] to-[#FF6B35] shadow-lg ${className}`}
      >
        <ShieldAlert className="text-white" size={iconSize} strokeWidth={2.5} />
      </div>
    );
  }

  return (
    <img
      src="/plato.png"
      alt="Plato Logo"
      className={`inline-flex ${sizeClass} rounded-xl object-contain shadow-lg ${className}`}
      loading="eager"
      onError={() => setLogoLoadError(true)}
    />
  );
}
