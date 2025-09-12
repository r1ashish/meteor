import React, { createContext, useContext, useMemo, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";

const ShopContext = createContext(null);
export const useShop = () => useContext(ShopContext);

export default function ShopProvider({ children }) {
  // State management
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [cart, setCart] = useState([]);
  const [orders, setOrders] = useState([]);
  const [query, setQuery] = useState("");
  
  const { currentUser } = useAuth();

  // Fetch products from MongoDB API
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/products');
        const result = await response.json();
        
        if (result.success) {
          setProducts(result.data);
        } else {
          setError('Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError('Network error');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Load user's cart from MongoDB (if logged in)
  useEffect(() => {
    const fetchCart = async () => {
      if (!currentUser?.uid) return;
      
      try {
        const response = await fetch(`/api/cart?userId=${currentUser.uid}`);
        const result = await response.json();
        
        if (result.success) {
          // Convert MongoDB cart to local cart format
          const cartItems = result.data.map(item => ({
            id: item.productId,
            name: item.productName,
            price: item.price,
            originalPrice: products.find(p => p.id === item.productId)?.originalPrice || item.price,
            quantity: item.quantity
          }));
          setCart(cartItems);
        }
      } catch (err) {
        console.error('Error fetching cart:', err);
      }
    };

    if (products.length > 0 && currentUser) {
      fetchCart();
    }
  }, [products, currentUser]);

  const totals = useMemo(() => {
    const totalItems = cart.reduce((s, i) => s + i.quantity, 0);
    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    const totalSavings = cart.reduce((s, i) => s + (i.originalPrice - i.price) * i.quantity, 0);
    return { totalItems, total, totalSavings };
  }, [cart]);

  // Enhanced search with stock availability
  const filteredProducts = useMemo(() => {
    const q = query.trim().toLowerCase();
    const base = products.map((p) => ({
      ...p,
      available: p.stock > 0,
      availableQty: p.stock || 0
    }));
    if (!q) return base;
    return base.filter((p) => 
      p.title.toLowerCase().includes(q) ||
      p.description.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.tags?.some(tag => tag.toLowerCase().includes(q))
    );
  }, [query, products]);

  // Add to cart with MongoDB persistence
  const addToCart = async (product, qty = 1) => {
    if (product.stock < qty) {
      alert("Not enough stock available for this item.");
      return;
    }

    // Update local state immediately for responsive UI
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

    // Persist to MongoDB if user is logged in
    if (currentUser?.uid) {
      try {
        await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            productId: product.id,
            quantity: qty,
            productName: product.title,
            price: product.price
          })
        });
      } catch (err) {
        console.error('Error saving to cart:', err);
      }
    }
  };

  const updateQty = async (index, change) => {
    const item = cart[index];
    if (!item) return;

    const product = products.find(p => p.id === item.id);
    if (change > 0 && product && product.stock < Math.abs(change)) {
      alert("No more stock left for this item.");
      return;
    }

    // Update local state
    setCart((prev) => {
      const next = [...prev];
      const cartItem = next[index];
      cartItem.quantity += change;
      
      if (cartItem.quantity <= 0) {
        next.splice(index, 1);
      }
      return next;
    });

    // Update MongoDB cart
    if (currentUser?.uid) {
      try {
        if (item.quantity + change <= 0) {
          // Remove item
          await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              productId: item.id
            })
          });
        } else {
          // Update quantity (set absolute quantity, not increment)
          await fetch('/api/cart', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              productId: item.id,
              quantity: change, // This will be handled by your API
              productName: item.name,
              price: item.price
            })
          });
        }
      } catch (err) {
        console.error('Error updating cart:', err);
      }
    }
  };

  const removeItem = async (index) => {
    const item = cart[index];
    if (!item) return;

    // Update local state
    setCart((prev) => {
      const next = [...prev];
      next.splice(index, 1);
      return next;
    });

    // Remove from MongoDB
    if (currentUser?.uid) {
      try {
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: currentUser.uid,
            productId: item.id
          })
        });
      } catch (err) {
        console.error('Error removing item:', err);
      }
    }
  };

  const clearCart = async () => {
    setCart([]);
    
    // Clear MongoDB cart
    if (currentUser?.uid) {
      try {
        // Delete all cart items for user
        for (const item of cart) {
          await fetch('/api/cart', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              userId: currentUser.uid,
              productId: item.id
            })
          });
        }
      } catch (err) {
        console.error('Error clearing cart:', err);
      }
    }
  };

  const createOrder = async ({ location, date, phone }) => {
    if (!currentUser?.uid) {
      alert('Please login to place order');
      return null;
    }

    const total = cart.reduce((s, i) => s + i.price * i.quantity, 0);
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: currentUser.uid,
          items: cart.map(item => ({
            productId: item.id,
            productName: item.name,
            price: item.price,
            quantity: item.quantity
          })),
          total,
          customerName: currentUser.displayName || currentUser.email.split('@')[0],
          customerEmail: currentUser.email,
          customerPhone: phone,
          shippingAddress: `${location}, Delivery Date: ${date}`
        })
      });

      const result = await response.json();
      
      if (result.success) {
        const order = {
          id: result.orderId,
          orderNumber: result.orderNumber,
          items: [...cart],
          location,
          date,
          phone,
          total,
          status: "pending",
          orderDate: new Date().toLocaleDateString()
        };
        
        setOrders((o) => [order, ...o]);
        setCart([]); // Cart is already cleared by API
        return order;
      } else {
        throw new Error(result.error);
      }
    } catch (err) {
      console.error('Error creating order:', err);
      alert('Failed to place order. Please try again.');
      return null;
    }
  };

  const value = {
    products,
    filteredProducts,
    loading,
    error,
    query,
    setQuery,
    cart,
    totals,
    addToCart,
    updateQty,
    removeItem,
    clearCart,
    orders,
    createOrder
  };

  return <ShopContext.Provider value={value}>{children}</ShopContext.Provider>;
}
