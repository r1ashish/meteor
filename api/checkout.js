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
    const orders = db.collection('orders');
    const cart = db.collection('cart');
    
    if (req.method === 'POST') {
      const { 
        userId, 
        items, 
        total, 
        customerName, 
        customerEmail, 
        customerPhone, 
        shippingAddress 
      } = req.body;
      
      // Create order
      const order = {
        userId,
        items,
        total,
        customerName,
        customerEmail,
        customerPhone,
        shippingAddress,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: new Date(),
        orderNumber: `MET-${Date.now()}`
      };
      
      const result = await orders.insertOne(order);
      
      // Clear user's cart after successful order
      await cart.deleteMany({ userId });
      
      // Create WhatsApp message
      const itemsList = items.map(item => 
        `• ${item.productName} x${item.quantity} - ₹${item.price * item.quantity}`
      ).join('\n');
      
      const whatsappMessage = `🛍️ *New Order from Meteor Store*

*Order #:* ${order.orderNumber}
*Customer:* ${customerName}
*Phone:* ${customerPhone}
*Email:* ${customerEmail}

*Items:*
${itemsList}

*Total Amount:* ₹${total}

*Shipping Address:*
${shippingAddress}

*Order Date:* ${new Date().toLocaleDateString('en-IN')}

Please confirm this order!`;
      
      res.status(201).json({ 
        success: true,
        orderId: result.insertedId,
        orderNumber: order.orderNumber,
        whatsappMessage: whatsappMessage,
        message: 'Order placed successfully!'
      });
    }
    
    if (req.method === 'GET') {
      const { userId, orderId } = req.query;
      
      if (orderId) {
        const order = await orders.findOne({ _id: orderId });
        res.status(200).json({ success: true, data: order });
      } else if (userId) {
        const userOrders = await orders.find({ userId }).sort({ createdAt: -1 }).toArray();
        res.status(200).json({ success: true, data: userOrders });
      } else {
        res.status(400).json({ success: false, error: 'Missing parameters' });
      }
    }
    
  } catch (error) {
    console.error('Checkout error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Checkout failed',
      message: error.message 
    });
  } finally {
    await client.close();
  }
}
