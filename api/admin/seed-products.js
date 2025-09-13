// api/admin/seed-products.js
import { MongoClient } from 'mongodb';

const uri = process.env.MONGODB_URI;
if (!uri) throw new Error('MONGODB_URI is not set in Vercel Environment Variables');

let cachedClient;
let cachedDb;
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
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ success: false, error: 'Method not allowed' });

  try {
    const { db } = await getDb();
    const products = db.collection('products');

    const now = new Date();

    const items = [
      {
        id: 'a4-bundle',
        title: 'A4 Paper Bundle',
        description: 'Premium quality A4 size papers (500 sheets) - 75 GSM for printing, writing, and office work.',
        price: 230,
        originalPrice: 290,
        discount: '21% OFF',
        image: 'https://raw.githubusercontent.com/r1ashish/meteor/main/photo_2025-09-12_00-00-56.jpg',
        stock: 100,
        category: 'office-supplies',
        status: 'active',
        tags: ['a4','paper','bundle'],
        createdAt: now,
        updatedAt: now
      },
      {
        id: 'notebooks',
        title: 'Premium Notebooks',
        description: 'High-quality spiral notebooks (Pack of 3) - 200 pages each, ruled lines, durable cover.',
        price: 55,
        originalPrice: 120,
        discount: '54% OFF',
        image: 'https://raw.githubusercontent.com/r1ashish/meteor/main/photo_2025-09-12_00-01-04.jpg',
        stock: 100,
        category: 'stationery',
        status: 'active',
        tags: ['notebooks','pack','ruled'],
        createdAt: now,
        updatedAt: now
      }
    ];

    // Upsert by id so re-running doesn’t duplicate
    const ops = items.map(doc => ({
      updateOne: {
        filter: { id: doc.id },
        update: { $set: doc },
        upsert: true
      }
    }));

    const result = await products.bulkWrite(ops, { ordered: true });
    res.status(200).json({ success: true, message: 'Seeded products', result });
  } catch (err) {
    console.error('Seed error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
}
