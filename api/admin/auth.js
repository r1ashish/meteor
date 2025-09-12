import { MongoClient } from 'mongodb';
import crypto from 'crypto';

const uri = "mongodb+srv://ashish8921singh_db_user:vRU66MoOvdAiB1UQ@cluster0.nhvgykm.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0";

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    const db = client.db('meteordb');
    const admins = db.collection('admins');
    
    if (req.method === 'POST') {
      const { username, password, action } = req.body;
      
      if (action === 'login') {
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const admin = await admins.findOne({ username, password: hashedPassword });
        
        if (admin) {
          // Generate session token
          const sessionToken = crypto.randomBytes(32).toString('hex');
          await admins.updateOne(
            { _id: admin._id },
            { $set: { sessionToken, lastLogin: new Date() } }
          );
          
          res.status(200).json({ 
            success: true, 
            token: sessionToken,
            adminId: admin._id,
            message: 'Login successful' 
          });
        } else {
          res.status(401).json({ success: false, message: 'Invalid credentials' });
        }
      }
      
      if (action === 'setup') {
        // Create first admin (run this once)
        const hashedPassword = crypto.createHash('sha256').update(password).digest('hex');
        const admin = {
          username,
          password: hashedPassword,
          role: 'super_admin',
          createdAt: new Date()
        };
        
        const existingAdmin = await admins.findOne({ username });
        if (existingAdmin) {
          res.status(400).json({ success: false, message: 'Admin already exists' });
        } else {
          const result = await admins.insertOne(admin);
          res.status(201).json({ success: true, adminId: result.insertedId });
        }
      }
    }
    
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  } finally {
    await client.close();
  }
}
