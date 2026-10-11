import { Link, useParams } from "react-router-dom";
import ProductHero from "../components/products/ProductHero";
import ProductAbout from "../components/products/ProductAbout";
import ProductGallery from "../components/products/ProductGallery";
import ProductOrder from "../components/products/ProductOrder";
import ProductReviews from "../components/products/ProductReviews";
import BackButton from "../components/BackButton";
import { useApiProductDetail } from "../hooks/useApiProducts";

const ProductDetail = () => {
  // :slug now holds the backend product UUID (see productAdapter.toUiProduct).
  const { slug } = useParams<{ slug: string }>();
  const { product, isLoading, error } = useApiProductDetail(slug);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] px-6 py-16" aria-label="Loading product">
        <div className="max-w-5xl mx-auto flex flex-col gap-4">
          <div className="h-72 rounded-3xl bg-neutral-100 animate-pulse" />
          <div className="h-8 w-2/3 bg-neutral-100 animate-pulse rounded-lg" />
          <div className="h-24 bg-neutral-100 animate-pulse rounded-2xl" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#FFF8F0] px-6 py-16">
        <BackButton />
        <div className="max-w-md mx-auto rounded-2xl border border-red-200 bg-red-50 px-5 py-10 text-center">
          <p className="font-semibold text-neutral-900">Product not found</p>
          <p className="text-sm text-red-700 mt-1">
            {error ?? "This product doesn't exist or is unavailable."}
          </p>
          <Link
            to="/"
            className="inline-block mt-5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFF8F0] overflow-x-hidden relative">
      <BackButton />

      <ProductHero product={product} />
      <ProductAbout product={product} />
      <ProductGallery product={product} />
      <ProductOrder product={product} />
      <ProductReviews product={product} />
    </div>
  );
};

export default ProductDetail;
