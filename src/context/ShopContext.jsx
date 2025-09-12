import React, { createContext, useContext, useMemo, useState } from "react";
import { PRODUCTS } from "../data/products";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export default function ShopProvider({ children }) {
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [stock, setStock] = useState({
    "a4-bundle": 100,
    notebooks: 100,
    combo: 50
  });
  const [admin, setAdmin] = useState({ loggedIn: false });

  const totals = useMemo(() => {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalSavings = cart.reduce(
      (s, i) => s + (i.originalPrice - i.price) * i.quantity,
      0
    );
    return { totalItems, total, totalSavings };
  }, [cart]);

  const addToCart = (product, qty = 1) => {
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
  };

  const updateQty = (index, change) => {
    setCart((prev) => {
      const next = [...prev];
      next[index].quantity += change;
      if (next[index].quantity <= 0) next.splice(index, 1);
      return next;
    });
  };

  const removeItem = (index) => {
    setCart((prev) => prev.filter((_, i) => i !== index));
  };

  const clearCart = () => setCart([]);

  const loginAdmin = (u, p) => {
    if (u === "admin" && p === "admin123") {
      setAdmin({ loggedIn: true });
      return true;
    }
    return false;
  };

  const updateStock = (id, value) => {
    setStock((s) => ({ ...s, [id]: Number(value || 0) }));
  };

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
    clearCart();
    return order;
  };

  const updateOrderStatus = (orderId, status) => {
    setOrders((os) => os.map((o) => (o.id === orderId ? { ...o, status } : o)));
  };

  const revenue = useMemo(
    () =>
      orders
        .filter((o) => o.status === "delivered")
        .reduce((s, o) => s + o.total, 0),
    [orders]
  );

  const value = {
    products: PRODUCTS,
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
