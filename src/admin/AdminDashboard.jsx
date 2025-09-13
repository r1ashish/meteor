import React, { useEffect, useMemo, useState } from 'react';

export default function AdminDashboard() {
  const [orders, setOrders] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      const [oRes, iRes] = await Promise.all([
        fetch('/api/orders?all=1'),
        fetch('/api/admin/inventory?lowStock=10')
      ]);
      const [oJson, iJson] = await Promise.all([oRes.json(), iRes.json()]);
      if (!oJson.success) throw new Error(oJson.error || 'Failed to load orders');
      if (!iJson.success) throw new Error(iJson.error || 'Failed to load inventory');
      setOrders(oJson.orders || []);
      setLowStock(iJson.items || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  const stats = useMemo(() => {
    const byStatus = orders.reduce((acc, o) => {
      acc[o.status] = (acc[o.status] || 0) + 1;
      return acc;
    }, {});
    const today = new Date().toDateString();
    const revenueToday = orders
      .filter(o => new Date(o.createdAt).toDateString() === today)
      .reduce((s, o) => s + (o.total || 0), 0);
    const totalRevenue = orders.reduce((s, o) => s + (o.total || 0), 0);
    return { byStatus, revenueToday, totalRevenue };
  }, [orders]);

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Admin Dashboard</h1>
          <p className="text-sm text-gray-500">Overview of sales, orders, and inventory health</p>
        </div>
        <button
          onClick={load}
          className="px-3 py-2 border rounded hover:bg-gray-50 active:scale-[0.99] transition"
        >
          Refresh
        </button>
      </div>

      {err && <div className="text-red-600">{err}</div>}
      {loading && <div>Loading...</div>}

      {/* KPI cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <KpiCard title="Revenue Today" value={`₹ ${stats.revenueToday?.toLocaleString() || 0}`} />
        <KpiCard title="Total Revenue" value={`₹ ${stats.totalRevenue?.toLocaleString() || 0}`} />
        <KpiCard title="Low-Stock Items" value={lowStock.length} />
      </div>

      {/* Status summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-4">
        <StatusCard label="Pending" count={stats.byStatus?.pending || 0} />
        <StatusCard label="Processing" count={stats.byStatus?.processing || 0} />
        <StatusCard label="Shipped" count={stats.byStatus?.shipped || 0} />
        <StatusCard label="Delivered" count={stats.byStatus?.delivered || 0} />
        <StatusCard label="Cancelled" count={stats.byStatus?.cancelled || 0} />
      </div>

      {/* Recent and Low stock */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="analytics">
        <RecentOrders orders={orders.slice(0, 8)} />
        <RecentLowStock items={lowStock} />
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <QuickLink href="/admin#orders" label="Manage Orders" />
        <QuickLink href="/admin#inventory" label="Inventory" />
        <QuickLink href="/admin#products" label="Products" />
      </div>
    </div>
  );
}

function KpiCard({ title, value }) {
  return (
    <div className="border rounded p-4 bg-white/70 backdrop-blur">
      <div className="text-gray-500 text-sm">{title}</div>
      <div className="text-2xl font-semibold mt-1">{value}</div>
    </div>
  );
}

function StatusCard({ label, count }) {
  return (
    <div className="border rounded p-4">
      <div className="text-sm text-gray-500">{label}</div>
      <div className="text-xl font-semibold">{count}</div>
    </div>
  );
}

function RecentOrders({ orders }) {
  return (
    <div className="border rounded p-4" id="orders">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">Recent Orders</div>
        <a href="/admin#orders" className="text-xs underline">See all</a>
      </div>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {orders.length === 0 && <div className="text-sm">No recent orders.</div>}
        {orders.map(o => (
          <div key={o._id} className="border rounded p-2 hover:bg-gray-50">
            <div className="flex items-center justify-between">
              <div className="font-medium truncate max-w-[60%]">{o._id}</div>
              <span className="text-xs px-2 py-0.5 border rounded">{o.status}</span>
            </div>
            <div className="text-xs text-gray-600">User: {o.userId}</div>
            <div className="text-sm">Total: ₹ {o.total}</div>
            <div className="text-xs text-gray-500">
              {o.items?.map(it => `${it.title || it.id} x ${it.quantity}`).join(', ')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecentLowStock({ items }) {
  return (
    <div className="border rounded p-4" id="inventory">
      <div className="flex items-center justify-between mb-2">
        <div className="text-sm text-gray-500">Low Stock</div>
        <a href="/admin#inventory" className="text-xs underline">Manage</a>
      </div>
      <div className="space-y-2 max-h-72 overflow-auto pr-1">
        {items.length === 0 && <div className="text-sm">All good — no low stock.</div>}
        {items.map(p => (
          <div key={p.id} className="flex items-center gap-3">
            <img src={p.image} alt={p.title} className="w-10 h-10 rounded object-cover" />
            <div className="flex-1">
              <div className="text-sm font-medium">{p.title}</div>
              <div className="text-xs text-gray-500">Stock: {p.stock}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function QuickLink({ href, label }) {
  return (
    <a href={href} className="border rounded p-4 hover:bg-gray-50 text-center">{label}</a>
  );
}
