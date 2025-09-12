import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  // Set CORS headers
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
    const cart = db.collection('cart');
    
    if (req.method === 'POST') {
      const { userId, productId, quantity, productName, price } = req.body;
      
      // Check if item already exists in cart
      const existingItem = await cart.findOne({ userId, productId });
      
      if (existingItem) {
        // Update quantity
        const result = await cart.updateOne(
          { userId, productId },
          { 
            $inc: { quantity: quantity },
            $set: { updatedAt: new Date() }
          }
        );
        res.status(200).json({ success: true, message: 'Cart updated', data: result });
      } else {
        // Add new item
        const cartItem = { 
          userId, 
          productId, 
          quantity, 
          productName,
          price,
          addedAt: new Date() 
        };
        const result = await cart.insertOne(cartItem);
        res.status(201).json({ success: true, message: 'Item added to cart', data: result });
      }
    }
    
    if (req.method === 'GET') {
      const { userId } = req.query;
      const cartItems = await cart.find({ userId }).toArray();
      const totalAmount = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      
      res.status(200).json({ 
        success: true, 
        data: cartItems, 
        totalItems: cartItems.length,
        totalAmount: totalAmount 
      });
    }
    
    if (req.method === 'DELETE') {
      const { userId, productId } = req.body;
      const result = await cart.deleteOne({ userId, productId });
      res.status(200).json({ success: true, message: 'Item removed', data: result });
    }
    
  } catch (error) {
    console.error('Cart error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Cart operation failed',
      message: error.message 
    });
  } finally {
    await client.close();
  }
}
