import React from "react";

export function FAQ() {
  return (
    <div className="section">
      <h1 className="text-center text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
        Frequently Asked Questions
      </h1>
      <div className="text-left space-y-4">
        <div>
          <h3 className="font-bold">What products are offered?</h3>
          <p>Premium stationery including A4 paper bundles, notebooks, and combo packs at discounted rates.</p>
        </div>
        <div>
          <h3 className="font-bold">Is the quality guaranteed?</h3>
          <p>Yes, all products are made from high-quality materials and come with quality assurance.</p>
        </div>
        <div>
          <h3 className="font-bold">How long does delivery take?</h3>
          <p>Usually within 24-48 hours of order confirmation depending on location.</p>
        </div>
        <div>
          <h3 className="font-bold">Do you offer bulk discounts?</h3>
          <p>Yes, contact us via WhatsApp for bulk pricing and additional discounts.</p>
        </div>
      </div>
    </div>
  );
}

export function Terms() {
  return (
    <div className="section">
      <h1 className="text-center text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
        Terms & Conditions
      </h1>
      <div className="text-left space-y-3">
        <p>1. Product Quality: Guaranteed; replaced if defective.</p>
        <p>2. Delivery: 24-48 hours in supported areas.</p>
        <p>3. Returns: Within 7 days if unused and in original condition.</p>
        <p>4. Payment: UPI and Cash on Delivery.</p>
        <p>5. Bulk Orders: Special pricing for 50+ units.</p>
      </div>
    </div>
  );
}

export function MyOrders() {
  return (
    <div className="section">
      <h1 className="text-center text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
        My Orders
      </h1>
      <p className="text-center opacity-70">Track your orders here. Feature coming soon!</p>
    </div>
  );
}
