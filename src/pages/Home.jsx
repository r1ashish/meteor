import React from "react";
import { useShop } from "../context/ShopContext";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const { products } = useShop();
  return (
    <div className="page">
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 md:gap-8">
        {products.map((p) => (
          <ProductCard key={p.id} product={p} />
        ))}
      </div>
    </div>
  );
}
