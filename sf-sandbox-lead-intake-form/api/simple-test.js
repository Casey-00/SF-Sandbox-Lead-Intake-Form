// Simple test endpoint
export default function handler(req, res) {
  res.status(200).json({
    message: 'Simple test endpoint working!',
    hasEnvToken: !!process.env.AIRTABLE_API_TOKEN
  });
}
