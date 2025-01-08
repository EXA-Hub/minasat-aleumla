// my-api/src/utils/blockVpnProxy.js
import ProxyCheck from 'proxycheck-ts';

const proxyCheck = new ProxyCheck({
  apiKey: process.env.PROXYCHECK_API_KEY,
  vpn: true,
  proxy: true,
});

// In-memory cache for verified IPs
const verifiedIPs = new Map();
const blockedIPs = new Map();

const isPrivateIP = (ip) => {
  const parts = ip.split('.');
  const firstOctet = parseInt(parts[0]);
  return (
    ip === '127.0.0.1' ||
    ip === '::1' ||
    ip.startsWith('192.168.') ||
    ip.startsWith('10.') ||
    (firstOctet === 172 && parseInt(parts[1]) >= 16 && parseInt(parts[1]) <= 31)
  );
};

const blockVpnProxy = async (req, res, next) => {
  const clientIP = req.clientIp;

  if (isPrivateIP(clientIP)) {
    return next();
  }

  // Check cache first
  if (verifiedIPs.has(clientIP)) return next();
  if (blockedIPs.has(clientIP))
    return res.status(403).json({
      error: 'Access denied. VPN or proxy detected.',
    });

  try {
    const result = await proxyCheck.checkIP(clientIP);

    if (result[clientIP].proxy === 'yes') {
      console.log(`Blocked proxy IP: ${clientIP}`);
      blockedIPs.set(clientIP, true);
      return res.status(403).json({
        error: 'Access denied. VPN or proxy detected.',
      });
    }

    // Cache successful verification
    verifiedIPs.set(clientIP, true);
    console.log(`Allowed and cached IP: ${clientIP}`);
  } catch (error) {
    console.error(`IP check failed for ${clientIP}:`, error);
    return res.status(403).json({ error: 'IP check failed' });
  }

  next();
};

export default blockVpnProxy;
