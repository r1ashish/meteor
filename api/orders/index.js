// api/orders/index.js
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

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();

  try {
    const { db } = await getDb();
    const orders = db.collection('orders');

    if (req.method === 'POST') {
      // Expect: { userId, items:[{id,title,price,quantity}], shipping?, contact?, note? }
      const body = req.body || {};
      const { userId, items = [], shipping = {}, contact = {}, note = '' } = body;

      if (!userId || !Array.isArray(items) || items.length === 0) {
        return res.status(400).json({ success: false, error: 'userId and non-empty items are required' });
      }

      const total = items.reduce((s, i) => s + Number(i.price || 0) * Number(i.quantity || 0), 0);
      const totalItems = items.reduce((s, i) => s + Number(i.quantity || 0), 0);
      const now = new Date();

      const order = {
        userId,
        items,
        status: 'pending',
        history: [{ status: 'pending', note: note || 'Order created', at: now, by: userId }],
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
      const { id, userId, all } = req.query || {};
      const { ObjectId } = await import('mongodb');

      if (id) {
        const doc = await orders.findOne({ _id: new ObjectId(id) });
        if (!doc) return res.status(404).json({ success: false, error: 'Order not found' });
        return res.status(200).json({ success: true, order: doc });
      }

      const filter = all ? {} : (userId ? { userId } : {});
      const list = await orders.find(filter).sort({ createdAt: -1 }).limit(200).toArray();
      return res.status(200).json({ success: true, orders: list });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
