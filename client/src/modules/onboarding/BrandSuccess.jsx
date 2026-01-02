import { useNavigate } from "react-router-dom";

const BrandSuccess = () => {
  const navigate = useNavigate();

  return (
    <section className="min-h-screen bg-[#FFF9F2] flex items-center justify-center px-4">
      <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center">
        <h1 className="text-2xl font-bold text-[#1A1C1E] mb-3">
          🎉 Brand Created!
        </h1>

        <p className="text-gray-600 mb-6">
          Your restaurant brand is ready. Let’s set up your operations.
        </p>

        <button
          onClick={() => navigate("/redirect")}
          className="bg-[#E65F41] hover:bg-[#d65339]
                     text-white px-6 py-2.5 rounded-xl font-semibold transition"
        >
          Go to Dashboard
        </button>
      </div>
    </section>
  );
};

export default BrandSuccess;
