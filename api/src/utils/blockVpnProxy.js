// api/src/utils/blockVpnProxy.js
import ProxyCheck from 'proxycheck-ts';
import ip from 'ip';

import getRedisClient from './libs/redisClient.js';

const blockVpnProxy = async (req, res, next) => {
  const clientIP = req.clientIp;
  if (ip.isPrivate(clientIP)) return next();
  const redisClient = await getRedisClient();
  // Check Redis cache first
  const isVerified = await redisClient.get(`${clientIP}`);
  if (isVerified) {
    if (isVerified === 'verified') return next();
    else
      return res.status(403).json({
        error: 'تم رفض الوصول. تم الكشف عن وكيل.',
      });
  }

  try {
    const result = await new ProxyCheck({
      apiKey: process.env.PROXYCHECK_API_KEY,
      vpn: true,
      proxy: true,
    }).checkIP(clientIP);

    if (result[clientIP].proxy === 'yes') {
      console.log(`Blocked proxy IP: ${clientIP}`);
      const redisClient = await getRedisClient();
      await redisClient.set(`${clientIP}`, 'blocked', { EX: 86400 }); // Cache for 24 hours
      return res.status(403).json({
        error: 'Access denied. VPN or proxy detected.',
      });
    }

    // Cache successful verification
    const redisClient = await getRedisClient();
    await redisClient.set(`${clientIP}`, 'verified', { EX: 86400 }); // Cache for 24 hours
    console.log(`Allowed and cached IP: ${clientIP}`);
  } catch (error) {
    console.error(`IP check failed for ${clientIP}:`, error);
    return res.status(403).json({ error: 'IP check failed' });
  }

  next();
};

export default blockVpnProxy;
