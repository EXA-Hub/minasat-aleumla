// api/src/utils/blockVpnProxy.js
import ip from 'ip';
import ProxyCheck from 'proxycheck-ts';
import getRedisClient from './libs/redisClient.js';

const blockVpnProxy = async (req, res, next) => {
  const clientIP = req.clientIp;
  if (ip.isPrivate(clientIP)) return next();
  const redisClient = await getRedisClient();
  const isVerified = await redisClient.get(`${clientIP}`);
  if (isVerified)
    if (isVerified === 'verified') return next();
    else
      return res.status(403).json({
        error: 'تم رفض الوصول. تم الكشف عن وكيل.',
      });

  try {
    console.log(`Checking IP: ${clientIP}`);
    const result = await new ProxyCheck({
      apiKey: process.env.PROXYCHECK_API_KEY,
    }).checkIP(clientIP, { vpn: 3 });
    console.log(result);
    if (result[clientIP]?.proxy === 'yes' || result[clientIP]?.vpn === 'yes') {
      console.log(`Blocked proxy IP: ${clientIP}`);
      await redisClient.set(`${clientIP}`, 'blocked', { EX: 86400 }); // Cache for 24 hours
      return res.status(403).json({
        error: 'تم رفض الوصول. تم الكشف عن وكيل.',
      });
    }
    // Cache successful verification
    await redisClient.set(`${clientIP}`, 'verified', { EX: 86400 }); // Cache for 24 hours
    console.log(`Allowed and cached IP: ${clientIP}`);
  } catch (error) {
    console.error(`IP check failed for ${clientIP}:`, error);
    return res
      .status(500)
      .json({ error: 'حدث خطاء في عملية التحقق من عنوان IP' });
  }

  next();
};

export default blockVpnProxy;
