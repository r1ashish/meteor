// api/health.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI; // set in Vercel Project Settings
let cachedClient = null;
let cachedDb = null;

async function getDb() {
  if (cachedDb && cachedClient) return { client: cachedClient, db: cachedDb };
  const client = new MongoClient(uri, { maxPoolSize: 5 });
  await client.connect();
  const db = client.db('meteordb'); // your DB name
  cachedClient = client;
  cachedDb = db;
  return { client, db };
}

export default async function handler(req, res) {
  try {
    const start = Date.now();
    const { db } = await getDb();

    // Ping and quick counts
    const admin = db.admin();
    const ping = await admin.ping();
    const productsCount = await db.collection('products').countDocuments().catch(() => 0);
    const ordersCount = await db.collection('orders').countDocuments().catch(() => 0);

    res.status(200).json({
      ok: true,
      ping,
      productsCount,
      ordersCount,
      db: 'meteordb',
      pingMs: Date.now() - start,
      ts: new Date().toISOString(),
    });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
}


