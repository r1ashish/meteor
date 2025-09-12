import React from "react";
import { useShop } from "../context/ShopContext";

export default function CartItem({ item, index }) {
  const { updateQty, removeItem } = useShop();
  const itemSavings = (item.originalPrice - item.price) * item.quantity;
  const itemTotal = item.price * item.quantity;

  return (
    <div className="bg-white/90 dark:bg-white/5 backdrop-blur-md rounded-xl p-4 shadow-md mb-3 border border-black/5 dark:border-white/10">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="min-w-[200px]">
          <h4 className="font-semibold mb-1">{item.name}</h4>
          <p className="text-sm opacity-80">₹{item.price} × {item.quantity}</p>
          <p className="text-xs text-emerald-600">You saved ₹{itemSavings}</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-md" onClick={() => updateQty(index, -1)}>-</button>
          <span className="px-3 py-2 bg-gray-100 dark:bg-white/10 rounded font-semibold">{item.quantity}</span>
          <button className="w-8 h-8 border-2 border-gray-200 dark:border-gray-700 rounded-md" onClick={() => updateQty(index, 1)}>+</button>
          <button className="ml-2 bg-red-500 text-white px-3 py-2 rounded-md" onClick={() => removeItem(index)}>Remove</button>
        </div>
        <div className="text-right font-bold text-emerald-600 text-lg">₹{itemTotal}</div>
      </div>
    </div>
  );
}
