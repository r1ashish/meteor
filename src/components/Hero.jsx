import React from "react";
import { useNavigate } from "react-router-dom";

export default function Hero() {
  const navigate = useNavigate();
  const gif =
    "https://media.giphy.com/media/v1.Y2lkPTc5MGI3NjExM3g0b3NxM2N6Z2JlaWc4b2J2dTI4ZnpqOWl3b2RiaHcyOHF0ZzZqOSZlcD12MV9naWZzX3NlYXJjaCZjdD1n/3o6Zt6ML6BklcajjsA/giphy.gif";

  return (
    <section className="relative overflow-hidden rounded-3xl shadow-2xl border border-white/20 dark:border-white/10 mb-8">
      <img
        src={gif}
        alt="Meteor Stationery Hero"
        className="w-full h-[260px] md:h-[360px] object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-black/20 to-transparent"></div>
      <div className="absolute inset-0 p-6 md:p-10 flex flex-col justify-center">
        <h2 className="text-white text-2xl md:text-4xl font-extrabold drop-shadow">
          World’s Best <span className="text-amber-300">Stationery</span> — All at One Place
        </h2>
        <p className="text-white/90 mt-2 max-w-xl">
          Premium collection, global brands, and 10,000+ products curated by Meteor.
        </p>
        <div className="flex gap-3 mt-4">
          <button
            className="btn btn-primary px-5"
            onClick={() => window.scrollTo({ top: 600, behavior: "smooth" })}
          >
            Shop Now
          </button>
          <button className="btn btn-secondary px-5" onClick={() => navigate("/cart")}>
            View Cart
          </button>
        </div>
      </div>
    </section>
  );
}
