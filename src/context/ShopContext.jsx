import React, { createContext, useContext, useMemo, useState } from "react";
import { PRODUCTS } from "../data/products";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export default function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState({ "a4-bundle": 100, notebooks: 100, combo: 50 });
  const [admin, setAdmin] = useState({ loggedIn: false });
  const [query, setQuery] = useState(""); // search text

  const totals = useMemo(() => {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalSavings = cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0);
    return { totalItems, total, totalSavings };
  }, [cart]);

  // Search results enriched with availability
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = PRODUCTS.map((p) => ({
      ...p,
      available: (stock[p.id] ?? 0) > 0,
      availableQty: stock[p.id] ?? 0
    }));
    if (!q) return base;
    return base.filter((p) => p.title.toLowerCase().includes(q));
  }, [query, stock]);

  const addToCart = (product, qty = 1) => {
    if ((stock[product.id] ?? 0) < qty) {
      alert("Not enough stock available for this item.");
      return;
    }
    setCart((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          id: product.id,
          name: product.title,
          price: product.price,
          originalPrice: product.originalPrice,
          quantity: qty
        }
      ];
    });
    // decrement stock to reflect reservation
    setStock((s) => ({ ...s, [product.id]: Math.max(0, (s[product.id] ?? 0) - qty) }));
  };

  const updateQty = (index, change) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      if (!item) return prev;
      if (change > 0 && (stock[item.id] ?? 0) < change) {
        alert("No more stock left for this item.");
        return prev;
      }
      item.quantity += change;
      if (item.quantity <= 0) {
        // return reserved stock
        setStock((s) => ({ ...s, [item.id]: (s[item.id] ?? 0) + (item.quantity + 1) }));
        next.splice(index, 1);
      } else {
        // adjust reservation
        setStock((s) => ({ ...s, [item.id]: Math.max(0, (s[item.id] ?? 0) - change) }));
      }
      return next;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => {
      const next = [...prev];
      const item = next[index];
      if (item) {
        // return all reserved stock
        setStock((s) => ({ ...s, [item.id]: (s[item.id] ?? 0) + item.quantity }));
        next.splice(index, 1);
      }
      return next;
    });
  };

  const clearCart = () => {
    setCart((prev) => {
      setStock((s) =>
        prev.reduce((acc, it) => ({ ...acc, [it.id]: (acc[it.id] ?? 0) + it.quantity }), { ...s })
      );
      return [];
    });
  };

  const loginAdmin = (u, p) => {
    if (u === "admin" && p === "admin123") {
      setAdmin({ loggedIn: true });
      return true;
    }
    return false;
  };

  const updateStock = (id, value) => setStock((s) => ({ ...s, [id]: Number(value || 0) }));

  const createOrder = ({ location, date, phone }) => {
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const order = {
      id: Date.now(),
      items: [...cart],
      location,
      date,
      phone,
      total,
      status: "pending",
      orderDate: new Date().toLocaleDateString()
    };
    setOrders((o) => [order, ...o]);
    setCart([]); // keep stock as already decremented
    return order;
  };

  const updateOrderStatus = (orderId, status) =>
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status } : o)));

  const revenue = useMemo(
    () => orders.filter((o) => o.status === "delivered").reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const value = {
    products: PRODUCTS,
    filteredProducts,
    query,
    setQuery,
    cart,
    totals,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    stock,
    updateStock,
    orders,
    createOrder,
    updateOrderStatus,
    admin,
    loginAdmin,
    revenue
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
