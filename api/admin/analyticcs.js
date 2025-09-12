import { MongoClient } from 'mongodb';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
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
    const products = db.collection('products');
    
    if (req.method === 'GET') {
      // Calculate date ranges
      const today = new Date();
      const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const startOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
      const startOfYear = new Date(today.getFullYear(), 0, 1);
      
      // Revenue Analytics
      const todayRevenue = await orders.aggregate([
        { $match: { createdAt: { $gte: startOfToday }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();
      
      const monthlyRevenue = await orders.aggregate([
        { $match: { createdAt: { $gte: startOfMonth }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();
      
      const yearlyRevenue = await orders.aggregate([
        { $match: { createdAt: { $gte: startOfYear }, status: { $ne: 'cancelled' } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]).toArray();
      
      // Order Statistics
      const totalOrders = await orders.countDocuments();
      const pendingOrders = await orders.countDocuments({ status: 'pending' });
      const completedOrders = await orders.countDocuments({ status: 'completed' });
      
      // Top Selling Products
      const topProducts = await orders.aggregate([
        { $unwind: "$items" },
        { 
          $group: { 
            _id: "$items.productId", 
            productName: { $first: "$items.productName" },
            totalSold: { $sum: "$items.quantity" },
            revenue: { $sum: { $multiply: ["$items.price", "$items.quantity"] } }
          } 
        },
        { $sort: { totalSold: -1 } },
        { $limit: 10 }
      ]).toArray();
      
      // Monthly Sales Trend (Last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const monthlySales = await orders.aggregate([
        { $match: { createdAt: { $gte: sixMonthsAgo } } },
        {
          $group: {
            _id: {
              year: { $year: "$createdAt" },
              month: { $month: "$createdAt" }
            },
            revenue: { $sum: "$total" },
            orderCount: { $sum: 1 }
          }
        },
        { $sort: { "_id.year": 1, "_id.month": 1 } }
      ]).toArray();
      
      // Recent Orders
      const recentOrders = await orders.find({})
        .sort({ createdAt: -1 })
        .limit(10)
        .toArray();
      
      res.status(200).json({
        success: true,
        analytics: {
          revenue: {
            today: todayRevenue[0]?.total || 0,
            monthly: monthlyRevenue[0]?.total || 0,
            yearly: yearlyRevenue[0]?.total || 0
          },
          orders: {
            total: totalOrders,
            pending: pendingOrders,
            completed: completedOrders
          },
          topProducts,
          monthlySales,
          recentOrders
        }
      });
    }
    
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
