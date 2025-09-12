import React, { useState } from "react";
import { useShop } from "../context/ShopContext";

export default function ProductCard({ product }) {
  const { addToCart } = useShop();
  const [qty, setQty] = useState(1);
  const saveEach = product.originalPrice - product.price;

  return (
    <div className="card relative flex flex-col">
      <span className="absolute top-3 right-3 bg-red-600 text-white px-3 py-1 rounded-xl text-xs font-bold z-10 shadow">
        {product.discount}
      </span>

      <div className="h-56 md:h-64 overflow-hidden">
        {product.image ? (
          <img
            src={product.image}
            alt={product.title}
            className="w-full h-full object-cover"
            onError={(e) => {
              if (product.fallback) e.currentTarget.src = product.fallback;
            }}
          />
        ) : (
          <div className="w-full h-full grid place-items-center text-white text-2xl font-extrabold bg-gradient-to-br from-brand-indigo to-brand-purple">
            COMBO DEAL
          </div>
        )}
      </div>

      <div className="p-5 flex flex-col gap-3">
        <h3 className="text-lg md:text-xl font-bold leading-snug">{product.title}</h3>
        <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-3">
          {product.description}
        </p>

        <div className="flex items-center gap-3">
          <span className="text-2xl font-extrabold text-emerald-600">₹{product.price}</span>
          <span className="text-base line-through text-gray-400">₹{product.originalPrice}</span>
          <span className="text-xs font-semibold bg-emerald-600 text-white px-2 py-1 rounded-md">
            Save ₹{saveEach}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-brand-indigo font-bold"
            onClick={() => setQty((q) => Math.max(1, q - 1))}
          >
            -
          </button>
          <input
            className="w-16 h-9 text-center border-2 border-gray-200 dark:border-gray-700 bg-white/90 dark:bg-white/5 rounded-lg font-semibold"
            type="number"
            min="1"
            value={qty}
            onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
          />
          <button
            className="w-9 h-9 border-2 border-gray-200 dark:border-gray-700 rounded-lg text-brand-indigo font-bold"
            onClick={() => setQty((q) => q + 1)}
          >
            +
          </button>
          <div className="ml-auto text-sm text-gray-500 dark:text-gray-300">You save ₹{saveEach * qty}</div>
        </div>

        <button
          className="btn btn-primary button-full"
          onClick={() => {
            addToCart(product, qty);
            alert("Added to cart successfully!");
          }}
        >
          Add to Cart
        </button>
      </div>
    </div>
  );
}
