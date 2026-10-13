import type { ApiProduct } from "../types/apiProduct";
import type { Product } from "../types/product";

function formatMoney(value: string | null): string {
  if (value === null || value === undefined || value === "") return "";
  return `$${value}`;
}

function formatStars(rating: string | number): string {
  const n = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(n) + "☆".repeat(5 - n);
}

export function toUiProduct(api: ApiProduct): Product {
  const image = api.image ?? "";
  const description = api.description ?? "";
  const rating = api.rating ?? "0";
  const reviewsCount = api.reviews_count ?? 0;
  return {
    id: api.id,
    slug: api.id,
    name: api.name,
    price: formatMoney(api.price),
    oldPrice: formatMoney(api.old_price),
    rating: formatStars(rating),
    image,
    description,
    highlights: [
      { title: api.category?.name ?? "Cake", subtitle: description.slice(0, 48) },
      {
        title: api.is_available ? "Freshly Baked" : "Currently Unavailable",
        subtitle: api.is_available ? "Available today" : "Check back soon",
      },
      {
        title: `Rating ${rating}`,
        subtitle: `${reviewsCount} happy customers`,
      },
    ],
    galleryItems: [
      { image, imageAlt: `${api.name} — photo 1` },
      { image, imageAlt: `${api.name} — photo 2` },
      { image, imageAlt: `${api.name} — photo 3` },
    ],
    reviews: { count: reviewsCount, items: [] },
  };
}
