// api/orders.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is not set');

let cachedClient, cachedDb;
async function getDb() {
  if (cachedDb) return { client: cachedClient, db: cachedDb };
  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db('meteordb');
  cachedClient = client; cachedDb = db;
  return { client, db };
}

// Valid statuses
const STATUSES = ['pending','processing','shipped','delivered','cancelled'];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await getDb();
    const orders = db.collection('orders');
    const products = db.collection('products');

    if (req.method === 'POST') {
      // Create an order
      // Expect body: { userId, items: [{ id, title, price, quantity }], shipping?, contact?, note? }
      const body = req.body || {};
      const { userId, items = [], shipping = {}, contact = {}, note = '' } = body;

      if (!userId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'userId and non-empty items are required' });
      }

      // Calculate totals
      const total = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
      const totalItems = items.reduce((s, i) => s + Number(i.quantity || 0), 0);

      const now = new Date();
      const order = {
        userId,
        items,
        status: 'pending',
        history: [
          { status: 'pending', note: note || 'Order created', at: now, by: userId }
        ],
        total,
        totalItems,
        shipping,
        contact,
        createdAt: now,
        updatedAt: now
      };

      const result = await orders.insertOne(order);
      return res.status(201).json({ success: true, orderId: result.insertedId, order });
    }

    if (req.method === 'GET') {
      // Query options:
      // ?id=ORDER_ID -> single
      // ?userId=USERID -> list by user
      // ?all=1 -> list all (for admin dashboards)
      const { id, userId, all } = req.query || {};

      if (id) {
        const { ObjectId } = await import('mongodb');
        const doc = await orders.findOne({ _id: new ObjectId(id) });
        if (!doc) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, order: doc });
      }

      let filter = {};
      if (!all && userId) filter.userId = userId; // user scoped
      // If all=1, return all orders (you can secure this later with admin auth)
      const list = await orders.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
      return res.status(200).json({ success: true, orders: list });
    }

    if (req.method === 'PUT') {
      // Update status
      // Expect body: { id, status, by, note? }
      const body = req.body || {};
      const { id, status, by = 'system', note = '' } = body;

      if (!id || !STATUSES.includes(status)) {
        return res.status(400).json({ success: false, error: 'Valid id and status are required' });
      }

      const { ObjectId } = await import('mongodb');
      const _id = new ObjectId(id);

      // Fetch order
      const order = await orders.findOne({ _id });
      if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

      // If already delivered/cancelled, prevent invalid transitions (optional rule)
      if (['delivered','cancelled'].includes(order.status)) {
        return res.status(400).json({ success: false, error: `Order already ${order.status}` });
      }

      const now = new Date();
      // Apply status update
      const historyEntry = { status, note, at: now, by };
      await orders.updateOne(
        { _id },
        { $set: { status, updatedAt: now }, $push: { history: historyEntry } }
      );

      // If status becomes delivered, decrement product stock
      if (status === 'delivered' && Array.isArray(order.items)) {
        for (const item of order.items) {
          if (!item?.id || !item?.quantity) continue;
          await products.updateOne(
            { id: item.id },
            { $inc: { stock: -Number(item.quantity) }, $set: { updatedAt: new Date() } }
          );
        }
      }

      const updated = await orders.findOne({ _id });
      return res.status(200).json({ success: true, order: updated });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
