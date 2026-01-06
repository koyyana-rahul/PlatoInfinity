import { useEffect, useState } from "react";
import axios from "axios";

export default function AddressAutocomplete({ onSelect }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.length < 3) {
      setResults([]);
      return;
    }

    const controller = new AbortController();

    const fetchResults = async () => {
      try {
        setLoading(true);

        const res = await axios.get(
          "https://nominatim.openstreetmap.org/search",
          {
            params: {
              q: query,
              format: "json",
              addressdetails: 1,
              countrycodes: "in",
              limit: 5,
            },
            headers: {
              "Accept-Language": "en",
              "User-Agent": "PlatoMenu/1.0 (contact@plato.app)",
            },
            signal: controller.signal,
          }
        );

        setResults(res.data || []);
      } catch (err) {
        if (err.name !== "CanceledError") {
          console.error("Address search failed", err);
        }
      } finally {
        setLoading(false);
      }
    };

    const delay = setTimeout(fetchResults, 400);
    return () => {
      clearTimeout(delay);
      controller.abort();
    };
  }, [query]);

  return (
    <div className="relative">
      <input
        className="input"
        placeholder="Search address"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      {loading && (
        <div className="absolute bg-white border w-full px-4 py-2 text-sm text-gray-500">
          Searching…
        </div>
      )}

      {results.length > 0 && (
        <div className="absolute bg-white border rounded shadow w-full mt-1 z-50 max-h-64 overflow-auto">
          {results.map((r) => (
            <button
              key={r.place_id}
              type="button"
              onClick={() => {
                onSelect({
                  placeId: String(r.place_id), // ✅ FIXED
                  addressText: r.display_name,
                  location: {
                    lat: Number(r.lat),
                    lng: Number(r.lon),
                  },
                });

                setQuery(r.display_name);
                setResults([]);
              }}
              className="block w-full px-4 py-2 text-left hover:bg-gray-100 text-sm"
            >
              {r.display_name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
