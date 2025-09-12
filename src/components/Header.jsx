import React, { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useShop } from "../context/ShopContext";

const nav = [
  { label: "Stationery", items: ["Ball Pen", "Gel Pen", "Notebooks", "Highlighters", "Sticky Notes", "A4 Paper", "Markers"] },
  { label: "Office Supplies", items: ["Files & Folders", "Paper Clips", "Staplers", "Envelopes", "ID Cards", "Whiteboard"] },
  { label: "Art Supplies", items: ["Acrylic Colors", "Acrylic Medium", "Acrylic Pad", "Brushes", "Canvas", "Palettes"] },
  { label: "Craft Material", items: ["Glitter Foam", "Origami", "Stickers", "Washi Tape", "Glue Gun", "Fevicryl"] }
];

export default function Header({ theme = "light", onToggleTheme = () => {} }) {
  const { totals } = useShop();
  const navigate = useNavigate();
  const [open, setOpen] = useState(null);
  const [mobileMenu, setMobileMenu] = useState(false);
  const firstBtn = useRef(null);

  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && setOpen(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      <header className="glass rounded-2xl my-4 shadow-lg sticky top-3 z-50 border border-black/5 dark:border-white/10">
        <div className="px-4 md:px-8 py-3 flex items-center gap-3">
          <button
            className="flex items-center gap-2 group"
            onClick={() => navigate("/")}
            aria-label="Meteor Home"
          >
            <span className="w-9 h-9 rounded-xl grid place-items-center bg-gradient-to-br from-brand-purple to-brand-indigo text-white shadow-md group-hover:scale-105 transition">
              ✦
            </span>
            <span className="text-2xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent">
              METEOR
            </span>
          </button>

          <button
            className="ml-auto md:hidden btn btn-secondary"
            onClick={() => setMobileMenu((s) => !s)}
            aria-label="Toggle menu"
          >
            ☰ Menu
          </button>

          <div className="hidden md:flex flex-1 items-center gap-2 mx-4">
            <div className="flex items-center gap-2 glass rounded-full px-4 py-2 w-full">
              <button className="px-3 py-1 rounded-full bg-gray-100 dark:bg-white/10 hover:bg-gray-200 dark:hover:bg-white/20 transition text-sm">
                All
              </button>
              <input className="flex-1 bg-transparent outline-none text-sm" placeholder="Search for articles, pens, notebooks..." />
              <button className="text-xl opacity-70 hover:opacity-100 transition" title="Voice search (placeholder)">🎤</button>
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button className="btn btn-secondary" onClick={onToggleTheme} aria-label="Toggle theme" title="Toggle light/dark">
              {theme === "dark" ? "🌙" : "🌞"}
            </button>
            <button className="btn btn-secondary" title="Profile">👤</button>
            <button className="btn btn-secondary relative" onClick={() => navigate("/cart")} title="Cart">
              🛒
              <span className="absolute -top-2 -right-2 bg-red-500 text-white w-5 h-5 rounded-full text-xs font-bold grid place-items-center">
                {totals.totalItems}
              </span>
            </button>
          </div>
        </div>

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

          {mobileMenu && (
            <div className="md:hidden p-3 space-y-2">
              <div className="glass rounded-xl p-2">
                <div className="flex gap-2 mb-2">
                  <input className="input flex-1" placeholder="Search..." />
                  <button className="btn btn-primary">Search</button>
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
                <div className="grid grid-cols-2 gap-2 pt-2">
                  <button className="btn btn-secondary">Best Sellers</button>
                  <button className="btn btn-secondary">Shop By Brand</button>
                  <button className="btn btn-secondary">Popular</button>
                  <button className="btn btn-primary">Back to School</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>
    </>
  );
}
