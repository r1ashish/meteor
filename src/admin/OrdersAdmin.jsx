import React, { useEffect, useState } from 'react';

const STATUS_FLOW = ['pending','processing','shipped','delivered','cancelled'];

export default function OrdersAdmin() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState('');

  async function load() {
    try {
      setLoading(true);
      const res = await fetch('/api/orders?all=1');
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to load orders');
      setOrders(json.orders || []);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { load(); }, []);

  async function updateStatus(id, status) {
    try {
      const res = await fetch('/api/orders/status', {
        method: 'PUT',
        headers: { 'Content-Type':'application/json' },
        body: JSON.stringify({ id, status, by: 'admin_ui', note: `Set to ${status}` })
      });
      const json = await res.json();
      if (!json.success) throw new Error(json.error || 'Failed to update');
      // optimistic refresh
      setOrders(prev => prev.map(o => (o._id === id ? json.order : o)));
    } catch (e) {
      alert(e.message);
    }
  }

  return (
    <div className="p-4 space-y-4">
      <h2 className="text-xl font-semibold">Orders</h2>
      {loading && <div>Loading...</div>}
      {err && <div className="text-red-600">{err}</div>}
      <div className="overflow-x-auto">
        <table className="min-w-full text-sm">
          <thead>
            <tr className="text-left border-b">
              <th className="p-2">Order ID</th>
              <th className="p-2">User</th>
              <th className="p-2">Items</th>
              <th className="p-2">Total</th>
              <th className="p-2">Status</th>
              <th className="p-2">Actions</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o._id} className="border-b">
                <td className="p-2">{o._id}</td>
                <td className="p-2">{o.userId}</td>
                <td className="p-2">
                  {o.items?.map(it => (
                    <div key={it.id}>{it.title} x {it.quantity}</div>
                  ))}
                </td>
                <td className="p-2">₹ {o.total}</td>
                <td className="p-2 font-medium">{o.status}</td>
                <td className="p-2 flex gap-2">
                  {STATUS_FLOW.filter(s => s !== o.status).map(s => (
                    <button
                      key={s}
                      className="px-2 py-1 border rounded hover:bg-gray-100"
                      onClick={() => updateStatus(o._id, s)}
                    >
                      {s}
                    </button>
                  ))}
                </td>
              </tr>
            ))}
            {orders.length === 0 && !loading && (
              <tr><td className="p-2" colSpan={6}>No orders yet</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
