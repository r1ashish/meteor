import React, { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import CartItem from "../components/CartItem";
import Modal from "../components/Modal";

export default function Cart() {
  const { cart, totals, createOrder } = useShop();
  const [open, setOpen] = useState(false);
  const [location, setLocation] = useState("Ruby General Hospital");
  const [date, setDate] = useState("");
  const [phone, setPhone] = useState("");

  const tomorrow = useMemo(() => {
    const t = new Date();
    t.setDate(t.getDate() + 1);
    return t.toISOString().split("T");
  }, []);

  const placeOrder = () => {
    if (!date || !phone) {
      alert("Please fill all required fields");
      return;
    }
    const otp = Math.floor(100000 + Math.random() * 900000);
    alert(`OTP sent to your WhatsApp: ${otp}\n\nIn a real implementation, this would be sent via WhatsApp Bot.`);
    const input = prompt("Enter the OTP you received:");
    if (String(input) === String(otp)) {
      createOrder({ location, date, phone });
      setOpen(false);
      alert("Order placed successfully! You will receive a confirmation on WhatsApp.");
    } else {
      alert("Invalid OTP. Please try again.");
    }
  };

  if (!cart.length) {
    return (
      <div className="section">
        <h1 className="text-center text-3xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
          Shopping Cart
        </h1>
        <p className="text-center opacity-70 text-lg">Your cart is empty</p>
      </div>
    );
  }

  return (
    <div className="section">
      <h1 className="text-center text-3xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
        Shopping Cart
      </h1>

      <div>
        {cart.map((item, idx) => (
          <CartItem key={item.id} item={item} index={idx} />
        ))}
      </div>

      <div className="bg-gradient-to-r from-brand-indigo to-brand-purple text-white rounded-2xl p-6 mt-4">
        <div className="mb-3">
          <p className="text-sm">Total Savings: ₹{totals.totalSavings}</p>
          <h3 className="text-2xl font-bold">Total: ₹{totals.total}</h3>
        </div>
        <button className="btn bg-white text-brand-indigo w-full rounded-xl font-semibold" onClick={() => setOpen(true)}>
          Proceed to Checkout
        </button>
      </div>

      <Modal open={open} onClose={() => setOpen(false)} title="🛒 Checkout">
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Delivery Location:</label>
            <select className="select" value={location} onChange={(e) => setLocation(e.target.value)}>
              <option>Ruby General Hospital</option>
              <option>Hussainpur Police Station</option>
              <option>Heritage College Campus</option>
              <option>City Center</option>
              <option>University Area</option>
            </select>
          </div>

          <div>
            <label className="block mb-1 font-semibold">Preferred Date:</label>
            <input className="input" type="date" min={tomorrow} value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="block mb-1 font-semibold">Phone Number:</label>
            <input className="input" placeholder="+91 XXXXXXXXXX" value={phone} onChange={(e) => setPhone(e.target.value)} />
          </div>

          <button className="btn btn-primary px-4 py-2" onClick={placeOrder}>
            Place Order
          </button>
        </div>
      </Modal>
    </div>
  );
}
