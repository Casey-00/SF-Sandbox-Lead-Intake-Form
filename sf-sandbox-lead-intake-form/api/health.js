// Health check endpoint
export default function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.status(200).json({ 
    status: 'API is running!',
    timestamp: new Date().toISOString()
  });
}
