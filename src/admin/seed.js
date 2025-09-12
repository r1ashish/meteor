import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

// Your current static products with MongoDB enhancements
const INITIAL_PRODUCTS = [
  {
    id: "a4-bundle",
    title: "A4 Paper Bundle",
    description: "Premium quality A4 size papers (500 sheets) - 75 GSM for printing, writing, and office work.",
    price: 220,
    originalPrice: 270,
    discount: "19% OFF",
    image: "https://raw.githubusercontent.com/r1ashish/meteor/main/photo_2025-09-12_00-00-56.jpg",
    fallback: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4IiBzdHlsZT0iZmlsbDojOTk5OyI+QTQgUGFwZXIgQnVuZGxlPC90ZXh0Pjwvc3ZnPg==",
    // MongoDB enhancements
    category: "office-supplies",
    subcategory: "paper", 
    brand: "Orient",
    sku: "ORN-A4-500",
    stock: 100,
    weight: "2.5kg",
    dimensions: "21x29.7cm",
    tags: ["office", "paper", "premium", "a4"],
    status: "active"
  },
  {
    id: "notebooks",
    title: "Premium Notebooks", 
    description: "High-quality spiral notebooks (Pack of 3) - 200 pages each, ruled lines, durable cover.",
    price: 55,
    originalPrice: 120,
    discount: "54% OFF",
    image: "https://raw.githubusercontent.com/r1ashish/meteor/main/photo_2025-09-12_00-01-04.jpg",
    fallback: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iI2YzZjRmNiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE4IiBzdHlsZT0iZmlsbDojOTk5OyI+UHJlbWl1bSBOb3RlYm9va3M8L3RleHQ+PC9zdmc+",
    category: "stationery",
    subcategory: "notebooks",
    brand: "Classmate", 
    sku: "CLS-NB-200-3",
    stock: 100,
    weight: "800g",
    dimensions: "24x18cm", 
    tags: ["notebooks", "ruled", "spiral", "pack"],
    status: "active"
  },
  {
    id: "combo",
    title: "Stationery Combo Pack",
    description: "A4 Paper Bundle (500 sheets) + Premium Notebooks (Pack of 3) for maximum savings.",
    price: 250,
    originalPrice: 390, 
    discount: "35% OFF",
    image: null,
    fallback: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjIwMCIgZmlsbD0iIzk1NWFkZiIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LXNpemU9IjE2IiBzdHlsZT0iZmlsbDojZmZmOyI+Q09NQk8gREVBTDwvdGV4dD48L3N2Zz4=",
    category: "combo",
    subcategory: "bundles",
    brand: "Meteor",
    sku: "MET-COMBO-001", 
    stock: 50,
    weight: "3.3kg",
    dimensions: "Bundle Pack",
    tags: ["combo", "deal", "bundle", "savings"],
    status: "active"
  }
];

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    const client = new MongoClient(uri);
    
    try {
      await client.connect();
      const db = client.db('meteordb');
      const products = db.collection('products');
      
      // Clear existing products
      await products.deleteMany({});
      
      // Add timestamps to all products
      const productsWithTimestamps = INITIAL_PRODUCTS.map(product => ({
        ...product,
        createdAt: new Date(),
        updatedAt: new Date()
      }));
      
      // Insert initial products
      const result = await products.insertMany(productsWithTimestamps);
      
      res.status(200).json({ 
        success: true, 
        message: `Seeded ${result.insertedCount} products successfully!`,
        products: productsWithTimestamps
      });
      
    } catch (error) {
      console.error('Seeding error:', error);
      res.status(500).json({ success: false, error: error.message });
    } finally {
      await client.close();
    }
  } else {
    res.status(405).json({ success: false, error: 'Method not allowed' });
  }
}
