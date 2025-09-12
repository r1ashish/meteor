import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('meteordb');
    const products = db.collection('products');
    
    if (req.method === 'GET') {
      const allProducts = await products.find({}).toArray();
      res.status(200).json({ success: true, data: allProducts });
    }
    
    if (req.method === 'POST') {
      const product = {
        ...req.body,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      const result = await products.insertOne(product);
      res.status(201).json({ success: true, data: result, productId: result.insertedId });
    }
    
  } catch (error) {
    console.error('Database error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Database connection failed',
      message: error.message 
    });
  } finally {
    await client.close();
  }
}
