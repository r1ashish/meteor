// api/orders/status.js
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

const STATUSES = ['pending','processing','shipped','delivered','cancelled'];

export default async function handler(req, res) {
  // CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'PUT, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'PUT') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { db } = await getDb();
    const orders = db.collection('orders');
    const products = db.collection('products');

    const body = req.body || {};
    const { id, status, by = 'system', note = '' } = body;

    if (!id || !STATUSES.includes(status)) {
      return res.status(400).json({ success: false, error: 'Valid id and status are required' });
    }

    const { ObjectId } = await import('mongodb');
    const _id = new ObjectId(id);

    const order = await orders.findOne({ _id });
    if (!order) return res.status(404).json({ success: false, error: 'Order not found' });

    if (['delivered','cancelled'].includes(order.status)) {
      return res.status(400).json({ success: false, error: `Order already ${order.status}` });
    }

    const now = new Date();
    const historyEntry = { status, note, at: now, by };

    await orders.updateOne(
      { _id },
      { $set: { status, updatedAt: now }, $push: { history: historyEntry } }
    );

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
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
