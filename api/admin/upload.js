import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary (you'll need to sign up at cloudinary.com - it's free)
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  api_key: process.env.CLOUDINARY_API_KEY || 'your-api-key', 
  api_secret: process.env.CLOUDINARY_API_SECRET || 'your-api-secret'
});

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method === 'POST') {
    try {
      const { imageData, folder = 'meteor-products' } = req.body;
      
      // Upload to Cloudinary
      const result = await cloudinary.uploader.upload(imageData, {
        folder: folder,
        transformation: [
          { width: 800, height: 800, crop: 'limit' },
          { quality: 'auto', fetch_format: 'auto' }
        ]
      });
      
      res.status(200).json({
        success: true,
        imageUrl: result.secure_url,
        publicId: result.public_id,
        message: 'Image uploaded successfully'
      });
      
    } catch (error) {
      console.error('Upload error:', error);
      res.status(500).json({
        success: false,
        error: 'Upload failed',
        message: error.message
      });
    }
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb'
    }
  }
};
