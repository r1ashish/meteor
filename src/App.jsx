import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
import UserDashboard from "./pages/UserDashboard";

// IMPORTANT: exact, case-correct paths
import ShopProvider from "./context/ShopContext";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header";
import ProtectedRoute from "./components/ProtectedRoute";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import { FAQ, Terms, MyOrders } from "./pages/Other";
import WhatsAppChat from "./components/WhatsAppChat";

// Import admin components
import AdminDashboard from "./admin/AdminDashboard";
import ProductManager from "./admin/ProductManager";
import Analytics from "./admin/Analytics";

export default function App() {
  // Theme state persisted to localStorage
  const [chatOpen, setChatOpen] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "light");

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") root.classList.add("dark");
    else root.classList.remove("dark");
    localStorage.setItem("theme", theme);
  }, [theme]);

  return (
    <AuthProvider>
      <ShopProvider>
        <div className="page">
          <Header
            theme={theme}
            onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
          />

          <main className="mt-2">
            <Routes>
              {/* Public Routes */}
              <Route path="/" element={<Home />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/faq" element={<FAQ />} />
              <Route path="/terms" element={<Terms />} />
              <Route path="/my-orders" element={<MyOrders />} />
              
              {/* Login Route - Changed from /admin to /login */}
              <Route path="/login" element={<Admin />} />
              
              {/* Keep /admin for backward compatibility, redirect to /login */}
              <Route path="/admin" element={<Admin />} />
              
              {/* User Dashboard - Protected for regular users */}
              <Route 
                path="/dashboard" 
                element={
                  <ProtectedRoute requireUser={true}>
                    <UserDashboard />
                  </ProtectedRoute>
                } 
              />
              
              {/* Admin Routes - Protected for admins only */}
              <Route 
                path="/admin/dashboard" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <AdminDashboard />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/products" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <ProductManager />
                  </ProtectedRoute>
                } 
              />
              <Route 
                path="/admin/analytics" 
                element={
                  <ProtectedRoute requireAdmin={true}>
                    <Analytics />
                  </ProtectedRoute>
                } 
              />
              
              {/* 404 Route */}
              <Route
                path="*"
                element={
                  <div className="section">
                    <h1 className="text-2xl font-bold">Not Found</h1>
                    <Link to="/" className="text-brand-indigo underline">
                      Go Home
                    </Link>
                  </div>
                }
              />
            </Routes>
          </main>

          {/* Floating WhatsApp button */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              setChatOpen(true);
            }}
            className="fixed bottom-5 right-5 w-14 h-14 rounded-full grid place-items-center text-3xl text-white shadow-xl"
            style={{ backgroundColor: "#25d366" }}
            aria-label="Open WhatsApp chat"
          >
            💬
          </a>

          <WhatsAppChat open={chatOpen} onClose={() => setChatOpen(false)} />
        </div>
      </ShopProvider>
    </AuthProvider>
  );
}
