import React, { useEffect, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";

// IMPORTANT: exact, case-correct paths
import ShopProvider from "./context/ShopContext";
import Header from "./components/Header";
import Home from "./pages/Home";
import Cart from "./pages/Cart";
import Admin from "./pages/Admin";
import { FAQ, Terms, MyOrders } from "./pages/Other";
import WhatsAppChat from "./components/WhatsAppChat";

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
    <ShopProvider>
      <div className="page">
        <Header
          theme={theme}
          onToggleTheme={() => setTheme((t) => (t === "dark" ? "light" : "dark"))}
        />

        <main className="mt-2">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/admin" element={<Admin />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/my-orders" element={<MyOrders />} />
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
  );
}
