import React, { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";
import { useAuth } from "../context/AuthContext";
import { signOutUser } from "../firebase/config";

const nav = [
  { label: "Stationery", items: ["Ball Pen", "Gel Pen", "Notebooks", "Highlighters", "Sticky Notes", "A4 Paper", "Markers"] },
  { label: "Office Supplies", items: ["Files & Folders", "Paper Clips", "Staplers", "Envelopes", "ID Cards", "Whiteboard"] },
  { label: "Art Supplies", items: ["Acrylic Colors", "Acrylic Medium", "Acrylic Pad", "Brushes", "Canvas", "Palettes"] },
  { label: "Craft Material", items: ["Glitter Foam", "Origami", "Stickers", "Washi Tape", "Glue Gun", "Fevicryl"] }
];

export default function Header({ theme = "light", onToggleTheme = () => {} }) {
  const { totals, query, setQuery } = useShop();
  const { currentUser, isAdmin, userData } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const [profileDropdown, setProfileDropdown] = useState(false);
  const firstBtn = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && (setOpen(null), setMobileMenu(false), setProfileDropdown(false));
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Handle profile icon click
  const handleProfileClick = () => {
    if (!currentUser) {
      // Not logged in - go to login page
      navigate("/login");
    } else {
      // Logged in - toggle dropdown
      setProfileDropdown(!profileDropdown);
    }
  };

  // Handle logout
  const handleLogout = async () => {
    const result = await signOutUser();
    if (result.success) {
      setProfileDropdown(false);
      navigate("/");
    }
  };

  // Go to dashboard
  const goToDashboard = () => {
    if (isAdmin) {
      navigate("/admin/dashboard");
    } else {
      navigate("/dashboard");
    }
    setProfileDropdown(false);
  };

  return (
    <>
      <header className="glass rounded-2xl my-4 shadow-lg sticky top-3 z-50 border border-black/5 dark:border-white/10">
        <div className="px-3 md:px-8 py-3 flex items-center gap-2">
          {/* Brand */}
          <button
            className="flex items-center gap-2 group shrink-0"
            onClick={() => navigate("/")}
            aria-label="Meteor Home"
          >
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-brand-purple to-brand-indigo text-white shadow-md group-hover:scale-105 transition">
              ✦
            </span>
            <span className="text-xl md:text-2xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
              METEOR
            </span>
          </button>

          {/* Desktop search */}
          <div className="hidden md:flex flex-1 items-center gap-2 mx-4">
            <div className="flex items-center gap-2 glass rounded-full px-3 py-2 w-full">
              <button className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition text-sm">
                All
              </button>
              <input
                className="flex-1 bg-transparent outline-none text-sm"
                placeholder="Search products by name…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && setMobileMenu(false)}
              />
              <button className="text-xl opacity-70 hover:opacity-100 transition" title="Search">🔎</button>
            </div>
          </div>

          {/* Mobile quick actions */}
          <div className="ml-auto flex md:hidden items-center gap-2">
            <button className="btn btn-secondary px-3" onClick={() => setMobileMenu((s) => !s)} aria-label="Toggle menu">☰</button>
            <button className="btn btn-secondary px-3" onClick={onToggleTheme} aria-label="Toggle theme">
              {theme === "dark" ? "🌙" : "🌞"}
            </button>
            <button className="btn btn-secondary px-3" onClick={() => navigate("/cart")} aria-label="Cart" title="Cart">
              🛒
              <span className="ml-1 text-xs font-bold">{totals.totalItems}</span>
            </button>
          </div>

          {/* Desktop actions */}
          <div className="hidden md:flex items-center gap-2">
            <button className="btn btn-secondary" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle light/dark">
              {theme === "dark" ? "🌙" : "🌞"}
            </button>
            
            {/* Updated Profile Button with Authentication */}
            <div className="relative">
              <button 
                className="btn btn-secondary relative" 
                onClick={handleProfileClick}
                title={currentUser ? "Profile Menu" : "Login"}
              >
                {currentUser && userData?.photoURL ? (
                  <img 
                    src={userData.photoURL} 
                    alt="Profile" 
                    className="w-5 h-5 rounded-full"
                  />
                ) : (
                  "👤"
                )}
                {/* Online indicator for logged in users */}
                {currentUser && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></span>
                )}
              </button>

              {/* Profile Dropdown - Shows when logged in */}
              {currentUser && profileDropdown && (
                <div className="absolute right-0 mt-2 w-56 bg-white dark:bg-gray-800 rounded-xl shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-50">
                  {/* User Info */}
                  <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-3">
                      {userData?.photoURL && (
                        <img 
                          src={userData.photoURL} 
                          alt="Profile" 
                          className="w-8 h-8 rounded-full"
                        />
                      )}
                      <div>
                        <p className="text-sm font-semibold text-gray-900 dark:text-white">
                          {userData?.displayName || 'User'}
                        </p>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{currentUser.email}</p>
                        <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          isAdmin 
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                        }`}>
                          {isAdmin ? 'Admin' : 'Customer'}
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  {/* Menu Items */}
                  <button
                    onClick={goToDashboard}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <span>{isAdmin ? '⚙️' : '📊'}</span>
                    {isAdmin ? 'Admin Dashboard' : 'My Dashboard'}
                  </button>
                  
                  <button
                    onClick={() => { setProfileDropdown(false); navigate("/my-orders"); }}
                    className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition flex items-center gap-2"
                  >
                    <span>📦</span>
                    My Orders
                  </button>
                  
                  <div className="border-t border-gray-200 dark:border-gray-700 mt-1 pt-1">
                    <button
                      onClick={handleLogout}
                      className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition flex items-center gap-2"
                    >
                      <span>🚪</span>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button className="btn btn-secondary relative" onClick={() => navigate("/cart")} title="Cart" aria-label="Cart">
              🛒
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold grid place-items-center">
                {totals.totalItems}
              </span>
            </button>
          </div>
        </div>

        {/* Desktop nav */}
        <div className="px-2 md:px-6 pb-3">
          <div className="hidden md:flex items-center gap-3">
            {nav.map((g, idx) => (
              <div
                key={g.label}
                className="relative"
                onMouseEnter={() => setOpen(idx)}
                onMouseLeave={() => setOpen(null)}
              >
                <button className="px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition flex items-center gap-1">
                  {g.label} <span>▾</span>
                </button>
                <div
                  className={`absolute left-0 mt-2 w-64 glass rounded-xl shadow-2xl p-2 border border-white/20 dark:border-white/10 transition ${
                    open === idx ? "opacity-100 translate-y-0 pointer-events-auto" : "opacity-0 -translate-y-1 pointer-events-none"
                  }`}
                >
                  {g.items.map((it, i) => (
                    <button
                      key={it}
                      ref={i === 0 ? firstBtn : undefined}
                      className="w-full text-left px-3 py-2 rounded-lg hover:bg-brand-indigo/10 dark:hover:bg-white/10 transition text-sm"
                    >
                      {it}
                    </button>
                  ))}
                </div>
              </div>
            ))}
            <button className="px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition">Best Sellers</button>
            <button className="px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition">Shop By Brand</button>
            <button className="px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition">Popular on Reels</button>
            <button className="px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition">Back to School</button>
            <button className="ml-auto px-3 py-2 rounded-lg bg-gradient-to-r from-brand-indigo to-brand-purple text-white hover:shadow-lg hover:-translate-y-0.5 transition">
              Clearance
            </button>
          </div>

          {/* Mobile drawer */}
          {mobileMenu && (
            <div className="md:hidden p-3 space-y-3">
              <div className="glass rounded-xl p-3">
                <div className="flex gap-2 mb-2">
                  <input
                    className="input flex-1"
                    placeholder="Search products…"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && setMobileMenu(false)}
                  />
                  <button className="btn btn-primary" onClick={() => setMobileMenu(false)}>Search</button>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  <button className="btn btn-secondary" onClick={onToggleTheme}>
                    {theme === "dark" ? "Dark" : "Light"}
                  </button>
                  <button className="btn btn-secondary" onClick={() => { setMobileMenu(false); navigate("/cart"); }}>
                    Cart ({totals.totalItems})
                  </button>
                  {/* Mobile Login/Profile Button */}
                  <button 
                    className="btn btn-primary" 
                    onClick={() => { 
                      setMobileMenu(false); 
                      if (currentUser) {
                        goToDashboard();
                      } else {
                        navigate("/login");
                      }
                    }}
                  >
                    {currentUser ? (isAdmin ? 'Admin' : 'Profile') : 'Login'}
                  </button>
                </div>

                {nav.map((g) => (
                  <details key={g.label} className="mb-2">
                    <summary className="cursor-pointer px-3 py-2 rounded-lg hover:bg-brand-indigo hover:text-white transition">
                      {g.label}
                    </summary>
                    <div className="pl-3 pt-2">
                      {g.items.map((it) => (
                        <button
                          key={it}
                          className="block w-full text-left px-3 py-2 rounded-lg hover:bg-brand-indigo/10 dark:hover:bg-white/10 transition text-sm"
                        >
                          {it}
                        </button>
                      ))}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
