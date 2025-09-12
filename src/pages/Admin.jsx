import React, { useMemo, useState } from "react";
import { useShop } from "../context/ShopContext";
import Modal from "../components/Modal";

export default function Admin() {
  const { admin, loginAdmin, orders, revenue, stock, updateStock, updateOrderStatus } = useShop();

  const [showLogin, setShowLogin] = useState(!admin.loggedIn);
  const [u, setU] = useState("");
  const [p, setP] = useState("");

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter((o) => o.status === "pending").length,
      delivered: orders.filter((o) => o.status === "delivered").length,
      revenue
    };
  }, [orders, revenue]);

  const tryLogin = () => {
    if (loginAdmin(u, p)) {
      setShowLogin(false);
      alert("Login successful!");
    } else {
      alert("Invalid credentials!");
    }
  };

  return (
    <div className="section">
      <h1 className="text-center text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-brand-indigo to-brand-purple bg-clip-text text-transparent mb-8">
        Admin Dashboard
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="rounded-2xl p-6 text-white text-center bg-gradient-to-r from-brand-indigo to-brand-purple">
          <h3 className="text-xl mb-1">Total Orders</h3>
          <p className="text-3xl font-extrabold">{stats.total}</p>
        </div>
        <div className="rounded-2xl p-6 text-white text-center bg-gradient-to-r from-yellow-500 to-orange-500">
          <h3 className="text-xl mb-1">Pending Orders</h3>
          <p className="text-3xl font-extrabold">{stats.pending}</p>
        </div>
        <div className="rounded-2xl p-6 text-white text-center bg-gradient-to-r from-emerald-500 to-emerald-600">
          <h3 className="text-xl mb-1">Delivered</h3>
          <p className="text-3xl font-extrabold">{stats.delivered}</p>
        </div>
        <div className="rounded-2xl p-6 text-white text-center bg-gradient-to-r from-pink-500 to-rose-600">
          <h3 className="text-xl mb-1">Revenue</h3>
          <p className="text-3xl font-extrabold">₹{stats.revenue}</p>
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
          <h2 className="text-xl font-bold mb-4">Manage Stock</h2>
          <div className="space-y-3">
            {Object.entries(stock).map(([id, value]) => {
              const displayName =
                id === "a4-bundle" ? "A4 Paper Bundle" : id === "notebooks" ? "Premium Notebooks" : "Stationery Combo Pack";
              return (
                <div key={id} className="bg-white/90 dark:bg-white/5 backdrop-blur p-4 rounded-xl shadow border border-black/5 dark:border-white/10 flex items-center justify-between">
                  <span className="font-semibold">{displayName}</span>
                  <div className="flex items-center gap-2">
                    <input className="input w-24" type="number" value={value} onChange={(e) => updateStock(id, e.target.value)} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex-1 glass rounded-2xl p-6 border border-white/20 dark:border-white/10">
          <h2 className="text-xl font-bold mb-4">Order Management</h2>
          {orders.length === 0 ? (
            <p>No orders yet.</p>
          ) : (
            <div className="space-y-4">
              {orders.map((o, idx) => (
                <div
                  key={o.id}
                  className={`bg-white/90 dark:bg-white/5 backdrop-blur p-4 rounded-xl border-l-4 ${
                    o.status === "delivered" ? "border-emerald-600" : "border-amber-500"
                  }`}
                >
                  <h4 className="font-semibold mb-1">Order #{orders.length - idx}</h4>
                  <p><strong>Customer:</strong> {o.phone}</p>
                  <p><strong>Location:</strong> {o.location}</p>
                  <p><strong>Date:</strong> {o.date}</p>
                  <p><strong>Total:</strong> ₹{o.total}</p>
                  <p><strong>Items:</strong> {o.items.map((i) => `${i.name} (${i.quantity})`).join(", ")}</p>
                  <div className="mt-2">
                    <select className="select" value={o.status} onChange={(e) => updateOrderStatus(o.id, e.target.value)}>
                      <option value="pending">Pending</option>
                      <option value="processing">Processing</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Modal open={showLogin} onClose={() => {}} title="👤 Admin Login">
        <div className="space-y-4">
          <div>
            <label className="block mb-1 font-semibold">Username:</label>
            <input className="input" value={u} onChange={(e) => setU(e.target.value)} placeholder="Enter username" />
          </div>
          <div>
            <label className="block mb-1 font-semibold">Password:</label>
            <input className="input" type="password" value={p} onChange={(e) => setP(e.target.value)} placeholder="Enter password" />
          </div>
          <button className="btn btn-primary px-4 py-2" onClick={tryLogin}>Login</button>
        </div>
      </Modal>
    </div>
  );
}
