import { MongoClient, ObjectId } from 'mongodb';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
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
      const totalProducts = await products.countDocuments();
      const lowStockProducts = await products.find({ stock: { $lt: 10 } }).toArray();
      
      res.status(200).json({ 
        success: true, 
        data: allProducts,
        stats: {
          totalProducts,
          lowStockCount: lowStockProducts.length,
          lowStockProducts
        }
      });
    }
    
    if (req.method === 'POST') {
      const { 
        name, 
        description, 
        price, 
        salePrice, 
        stock, 
        category, 
        images, 
        specifications,
        status = 'active' 
      } = req.body;
      
      const product = {
        name,
        description,
        price: parseFloat(price),
        salePrice: salePrice ? parseFloat(salePrice) : null,
        stock: parseInt(stock),
        category,
        images: images || [],
        specifications: specifications || {},
        status,
        views: 0,
        sales: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const result = await products.insertOne(product);
      res.status(201).json({ 
        success: true, 
        data: result, 
        productId: result.insertedId,
        message: 'Product created successfully' 
      });
    }
    
    if (req.method === 'PUT') {
      const { productId, ...updateData } = req.body;
      
      updateData.updatedAt = new Date();
      if (updateData.price) updateData.price = parseFloat(updateData.price);
      if (updateData.salePrice) updateData.salePrice = parseFloat(updateData.salePrice);
      if (updateData.stock) updateData.stock = parseInt(updateData.stock);
      
      const result = await products.updateOne(
        { _id: new ObjectId(productId) },
        { $set: updateData }
      );
      
      res.status(200).json({ 
        success: true, 
        data: result,
        message: 'Product updated successfully' 
      });
    }
    
    if (req.method === 'DELETE') {
      const { productId } = req.body;
      
      const result = await products.deleteOne({ _id: new ObjectId(productId) });
      res.status(200).json({ 
        success: true, 
        data: result,
        message: 'Product deleted successfully' 
      });
    }
    
  } catch (error) {
    console.error('Admin products error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
