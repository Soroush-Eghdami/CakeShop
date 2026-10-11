import { Link } from "react-router-dom";
import { useOrders } from "../hooks/useOrders";
import type { OrderStatus } from "../types/order";

const statusStyles: Record<string, string> = {
  waiting_for_approval: "bg-amber-50 text-amber-700 border-amber-200",
  confirmed: "bg-sky-50 text-sky-700 border-sky-200",
  preparing: "bg-orange-50 text-orange-700 border-orange-200",
  out_for_delivery: "bg-blue-50 text-blue-700 border-blue-200",
  delivered: "bg-green-50 text-green-700 border-green-200",
  canceled: "bg-red-50 text-red-700 border-red-200",
};

function formatStatus(status: OrderStatus): string {
  return status.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatDate(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString();
}

export default function OrdersPage() {
  const { orders, isLoading, error, isUnauthorized, refetch } = useOrders();

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-neutral-900">My Orders</h1>
          <p className="text-sm text-neutral-500 mt-1">
            Your orders, newest first.
          </p>
        </div>
        <button
          onClick={refetch}
          disabled={isLoading}
          className="text-sm font-medium text-red-700 hover:text-red-900 border border-red-200 hover:border-red-300 rounded-full px-4 py-1.5 transition-colors disabled:opacity-50"
        >
          {isLoading ? "Loading..." : "Refresh"}
        </button>
      </div>

      {isLoading && (
        <div className="flex flex-col gap-3" aria-label="Loading orders">
          {[0, 1, 2].map((i) => (
            <div
              key={i}
              className="h-36 rounded-2xl bg-neutral-100 animate-pulse"
            />
          ))}
        </div>
      )}

      {!isLoading && error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 px-5 py-8 text-center">
          <p className="text-sm text-red-700 font-medium">{error}</p>
          {isUnauthorized ? (
            <Link
              to="/login"
              className="inline-block mt-4 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Sign In
            </Link>
          ) : (
            <button
              onClick={refetch}
              className="mt-4 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
            >
              Try Again
            </button>
          )}
        </div>
      )}

      {!isLoading && !error && orders.length === 0 && (
        <div className="rounded-2xl border border-neutral-200 bg-white px-5 py-12 text-center">
          <p className="text-neutral-900 font-semibold">No orders yet</p>
          <p className="text-sm text-neutral-500 mt-1">
            When you place an order it will show up here.
          </p>
          <Link
            to="/"
            className="inline-block mt-5 bg-red-700 hover:bg-red-800 text-white text-sm font-semibold px-6 py-2.5 rounded-full transition-colors"
          >
            Browse Cakes
          </Link>
        </div>
      )}

      {!isLoading && !error && orders.length > 0 && (
        <div className="flex flex-col gap-4">
          {orders.map((order) => (
            <article
              key={order.id}
              className="rounded-2xl border border-neutral-200 bg-white p-5 shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-bold text-neutral-900">
                    Order #{order.id}
                  </span>
                  <span
                    className={`text-xs font-medium border rounded-full px-2.5 py-0.5 ${
                      statusStyles[order.status] ??
                      "bg-neutral-100 text-neutral-600 border-neutral-200"
                    }`}
                  >
                    {formatStatus(order.status)}
                  </span>
                </div>
                <span className="text-xs text-neutral-500">
                  {formatDate(order.created_at)}
                </span>
              </div>

              <div className="mt-3 divide-y divide-neutral-100 border-t border-neutral-100">
                {order.items.map((item, idx) => (
                  <div
                    key={`${item.product_name}-${idx}`}
                    className="flex items-center justify-between gap-3 py-2.5 text-sm"
                  >
                    <div>
                      <p className="font-medium text-neutral-800">
                        {item.product_name}
                        <span className="text-neutral-400 font-normal">
                          {" "}
                          × {item.quantity}
                        </span>
                      </p>
                      {item.old_price_at_purchase && (
                        <p className="text-xs text-neutral-400 line-through">
                          {item.old_price_at_purchase}
                        </p>
                      )}
                    </div>
                    <span className="font-semibold text-neutral-900 whitespace-nowrap">
                      {item.price_at_purchase}
                    </span>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-2 border-t border-neutral-100 pt-3 text-sm">
                <span className="text-neutral-500">
                  {order.city} · {order.payment_method}
                </span>
                <span className="font-bold text-neutral-900">
                  Total: {order.total_price}
                </span>
              </div>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
