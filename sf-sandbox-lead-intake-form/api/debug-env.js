export default function handler(req, res) {
  const envCheck = {
    SF_ENVIRONMENT: process.env.SF_ENVIRONMENT,
    SF_LOGIN_URL: process.env.SF_LOGIN_URL,
    SF_CLIENT_ID_EXISTS: !!process.env.SF_CLIENT_ID,
    SF_CLIENT_SECRET_EXISTS: !!process.env.SF_CLIENT_SECRET,
    SF_USERNAME_EXISTS: !!process.env.SF_USERNAME,
    SF_PASSWORD_EXISTS: !!process.env.SF_PASSWORD,
    SF_SECURITY_TOKEN_EXISTS: !!process.env.SF_SECURITY_TOKEN,
  };
  
  res.status(200).json(envCheck);
}
