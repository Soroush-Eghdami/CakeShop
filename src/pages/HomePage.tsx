import Footer from "../components/footer/Footer";
import BestSellerSection from "../components/home/BestSellerSection";
import HeroSection from "../components/home/HeroSection";
import MenuSection from "../components/home/MenuSection";
import PromiseSection from "../components/home/PromiseSection";
import { useApiProducts } from "../hooks/useApiProducts";

const HomePage = () => {
  const { products, isLoading, error, refetch } = useApiProducts();

  return (
    <>
      <HeroSection />
      <MenuSection />
      {isLoading ? (
        <div className="max-w-6xl mx-auto px-4 pb-12" aria-label="Loading products">
          <div className="h-8 w-64 bg-neutral-100 animate-pulse rounded-lg mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-2xl bg-neutral-100 animate-pulse" />
            ))}
          </div>
        </div>
      ) : error ? (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
            <p className="text-sm text-red-700 font-medium">{error}</p>
            <button
              onClick={refetch}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Try Again
            </button>
          </div>
        </div>
      ) : products.length === 0 ? (
        <div className="max-w-6xl mx-auto px-4 pb-12">
          <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-10 text-center">
            <p className="font-semibold text-neutral-900">No products yet</p>
            <p className="text-sm text-neutral-500 mt-1">
              The API returned an empty list — add products in Django admin
              (/admin/) and mark them available.
            </p>
            <button
              onClick={refetch}
              className="mt-4 border border-red-200 text-red-700 hover:border-red-300 text-sm font-medium px-6 py-2 rounded-full transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      ) : (
        <BestSellerSection products={products} />
      )}
      <PromiseSection />
      <Footer />
    </>
  );
};

export default HomePage;
