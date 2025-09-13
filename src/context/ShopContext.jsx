import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export default function ShopProvider({ children }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState(null);
  const [cart, setCart]         = useState([]);
  const [orders, setOrders]     = useState([]);
  const [query, setQuery]       = useState("");
  const [coupon, setCoupon]     = useState(null);

  const { currentUser } = useAuth();

  // Fetch products
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('/api/products');
        const json = await res.json();
        if (json.success) setProducts(json.data || []);
        else setError(json.error || 'Failed to fetch products');
      } catch (e) {
        console.error('Error fetching products:', e);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  // Load cart for user
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser?.uid) return;
      try {
        const res = await fetch(`/api/cart?userId=${currentUser.uid}`);
        const json = await res.json();
        if (json.success) {
          const items = (json.data || []).map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            originalPrice: products.find(p => p.id === item.productId)?.originalPrice || item.price,
            quantity: item.quantity
          }));
          setCart(items);
        }
      } catch (e) {
        console.error('Error fetching cart:', e);
      }
    };
    if (products.length > 0 && currentUser) fetchCart();
  }, [products, currentUser]);

  // Derived totals (supports coupon extension)
  const totals = useMemo(() => {
    const subtotal     = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalItems   = cart.reduce((s, i) => s + i.quantity, 0);
    const totalSavings = cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0);
    const discount     = coupon?.type === 'flat' ? coupon.value : 0; // extend as needed
    const total        = Math.max(0, subtotal - discount);
    return { subtotal, totalItems, totalSavings, discount, total };
  }, [cart, coupon]);

  // Search + availability
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = products.map(p => ({
      ...p,
      available: (p.stock || 0) > 0,
      availableQty: p.stock || 0
    }));
    if (!q) return base;
    return base.filter(p =>
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      (p.tags || []).some(tag => tag.toLowerCase().includes(q))
    );
  }, [query, products]);

  // Cart: add
  const addToCart = async (product, qty = 1) => {
    const stock = product?.stock || 0;
    if (stock < qty) {
      alert("Not enough stock available.");
      return;
    }
    // optimistic update
    setCart(prev => {
      const ex = prev.find(i => i.id === product.id);
      if (ex) return prev.map(i => i.id === product.id ? { ...i, quantity: i.quantity + qty } : i);
      return [...prev, {
        id: product.id, name: product.title, price: product.price,
        originalPrice: product.originalPrice, quantity: qty
      }];
    });
    // persist if logged in
    if (currentUser?.uid) {
      try {
        await fetch('/api/cart', {
          method:'POST',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({
            userId: currentUser.uid,
            productId: product.id,
            quantity: qty,
            productName: product.title,
            price: product.price
          })
        });
      } catch (e) {
        console.error('Persist cart failed:', e);
      }
    }
  };

  // Cart: update quantity
  const updateQty = async (index, change) => {
    const item = cart[index];
    if (!item) return;
    const product = products.find(p => p.id === item.id);
    if (change > 0 && product && (product.stock || 0) < Math.abs(change)) {
      alert('No more stock left for this item.');
      return;
    }
    setCart(prev => {
      const next = [...prev];
      const n = next[index].quantity + change;
      if (n <= 0) next.splice(index, 1);
      else next[index] = { ...next[index], quantity: n };
      return next;
    });
    if (currentUser?.uid) {
      try {
        if (item.quantity + change <= 0) {
          await fetch('/api/cart', {
            method:'DELETE',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId: currentUser.uid, productId: item.id })
          });
        } else {
          await fetch('/api/cart', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({
              userId: currentUser.uid,
              productId: item.id,
              quantity: change,
              productName: item.name,
              price: item.price
            })
          });
        }
      } catch (e) {
        console.error('Update cart failed:', e);
      }
    }
  };

  // Cart: remove
  const removeItem = async (index) => {
    const item = cart[index];
    if (!item) return;
    setCart(prev => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });
    if (currentUser?.uid) {
      try {
        await fetch('/api/cart', {
          method:'DELETE',
          headers:{'Content-Type':'application/json'},
          body: JSON.stringify({ userId: currentUser.uid, productId: item.id })
        });
      } catch (e) {
        console.error('Remove item failed:', e);
      }
    }
  };

  // Cart: clear
  const clearCart = async () => {
    const snapshot = [...cart];
    setCart([]);
    if (currentUser?.uid) {
      try {
        for (const item of snapshot) {
          await fetch('/api/cart', {
            method:'DELETE',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify({ userId: currentUser.uid, productId: item.id })
          });
        }
      } catch (e) {
        console.error('Clear cart failed:', e);
      }
    }
  };

  // Create order against /api/orders
  const createOrder = async ({ location, date, phone }) => {
    if (!currentUser?.uid) {
      alert('Please login to place order');
      return null;
    }
    const payload = {
      userId: currentUser.uid,
      items: cart.map(i => ({ id: i.id, title: i.name, price: i.price, quantity: i.quantity })),
      shipping: { address: `${location}`, date },
      contact: { phone },
      note: 'Checkout via ShopContext'
    };
    try {
      const res = await fetch('/api/orders', {
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify(payload)
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Order failed');
      setOrders(o => [json.order, ...o]);
      setCart([]);
      return json.order;
    } catch (e) {
      console.error('Create order failed:', e);
      alert('Failed to place order. Please try again.');
      return null;
    }
  };

  const value = {
    products,
    filteredProducts,
    loading,
    error,
    query, setQuery,
    cart, totals,
    addToCart, updateQty, removeItem, clearCart,
    orders, createOrder,
    coupon, setCoupon
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
