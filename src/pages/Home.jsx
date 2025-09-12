import React, { useMemo } from "react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { filteredProducts, query } = useShop();
  const q = (query || "").trim();

  const stats = useMemo(() => {
    const totalMatches = filteredProducts.length;
    const inStock = filteredProducts.filter((p) => p.available).length;
    return { totalMatches, inStock };
  }, [filteredProducts]);

  const showEmpty =
    q.length > 0 && (stats.totalMatches === 0 || stats.inStock === 0);

  return (
    <div className="page">
      {q && (
        <p className="mb-3 text-sm opacity-70">
          Showing results for “{q}” · {stats.inStock}/{stats.totalMatches} available
        </p>
      )}

      {showEmpty ? (
        <div className="card p-8 text-center">
          <h2 className="text-xl font-bold mb-2">Oops…</h2>
          {stats.totalMatches === 0 ? (
            <p className="opacity-80">
              There is no item named “{q}”. Try another keyword.
            </p>
          ) : (
            <p className="opacity-80">
              “{q}” is currently out of stock. Please check back later.
            </p>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5 md:gap-8">
          {filteredProducts.map((p) => (
            <div key={p.id} className="relative">
              {!p.available && (
                <span className="absolute z-10 top-2 left-2 bg-rose-600 text-white text-xs font-bold px-2 py-1 rounded">
                  Out of stock
                </span>
              )}
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
