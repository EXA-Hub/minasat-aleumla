import { decryptToken } from './token-sys.js';
import User from './schemas/mongoUserSchema.js';

/**
 * Middleware to verify the token in the Authorization header.
 * It decrypts the token, extracts user data, and attaches the user object to the request.
 */
const authenticateTokenMiddleware = async (req, res, next, handleError) => {
  // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.headers['authorization']?.split(' ')[1];

  if (!token) return handleError('يرجى تسجيل الدخول.');

  try {
    // Decrypt the token to get user data (username, uid, password)
    const decryptedData = decryptToken(token);
    const [username, uid, password] = decryptedData.split('\n');

    // Find the user from the database using the extracted username
    const user = await User.findOne({ username, _id: uid });

    if (!user) return handleError('ربما المستخدم غير موجود!؟');
    if (!(user.password === password))
      return handleError('يرجى إعادة تسجيل الدخول.');

    // Attach the user object to the request
    req.user = user;
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    return handleError('يرجى إعادة تسجيل الدخول. (لاحقا)');
  }
};

// Wrapper to ensure backward compatibility
const authenticateToken = (req, res, next) =>
  authenticateTokenMiddleware(req, res, next, (error) =>
    res.status(500).json({ error })
  );

export { authenticateTokenMiddleware, authenticateToken };
