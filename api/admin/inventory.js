// api/admin/inventory.js
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
    const products = db.collection('products');

    if (req.method === 'GET') {
      // GET /api/admin/inventory?lowStock=10
      const low = Number(req.query.lowStock ?? 10);
      const items = await products.find({ stock: { $lte: low } }, { projection: { _id: 0 } }).toArray();
      return res.status(200).json({ success: true, lowStockThreshold: low, items });
    }

    if (req.method === 'POST') {
      // POST JSON: { id, delta } OR { id, set }
      const body = req.body || {};
      const { id, delta, set } = body;
      if (!id || (typeof delta !== 'number' && typeof set !== 'number')) {
        return res.status(400).json({ success: false, error: 'id and delta OR id and set are required' });
      }

      let update;
      if (typeof delta === 'number') {
        update = { $inc: { stock: delta }, $set: { updatedAt: new Date() } };
      } else {
        update = { $set: { stock: Number(set), updatedAt: new Date() } };
      }

      const result = await products.updateOne({ id }, update);
      if (result.matchedCount === 0) return res.status(404).json({ success: false, error: 'Product not found' });

      const doc = await products.findOne({ id }, { projection: { _id: 0 } });
      return res.status(200).json({ success: true, product: doc });
    }

    return res.status(405).json({ success: false, error: 'Method not allowed' });
  } catch (err) {
    return res.status(500).json({ success: false, error: err.message });
  }
}
