import { decryptToken } from './token-sys.js'; // Assuming this is where the encryption and decryption logic is stored
import User from './schemas/mongoUserSchema.js'; // Path to your MongoDB user model

/**
 * Middleware to verify the token in the Authorization header.
 * It decrypts the token, extracts user data, and attaches the user object to the request.
 */
const authenticateToken = async (req, res, next) => {
  // Extract the token from the Authorization header (format: "Bearer <token>")
  const token = req.headers['authorization']?.split(' ')[1];

  // If no token is provided, return an error
  if (!token) {
    return res.status(401).json({ error: 'يرجى تسجيل الدخول.' });
  }

  try {
    // Decrypt the token to get user data (username, uid, password)
    const decryptedData = decryptToken(token);

    // Extract user information (assuming username, uid, password were part of the token data)
    const [username, uid, password] = decryptedData.split('\n');

    // Find the user from the database using the extracted username
    const user = await User.findOne({ username, _id: uid });

    // If the user does not exist in the database, return an error
    if (!user)
      return res
        .status(401)
        .json({ error: 'ربما المستخدم غير موجود!؟ جرب تسجيل الدخول مجددا.' });

    // Optionally, verify that the password from the token matches the stored one
    if (!(user.password === password))
      return res.status(401).json({ error: 'يرجى إعادة تسجيل الدخول.' });

    // Attach the user object to the request (req.user), so it can be accessed in other routes
    req.user = user;

    // Proceed to the next middleware/route handler
    next();
  } catch (error) {
    console.error('Token authentication error:', error);
    return res.status(500).json({ error: 'Failed to authenticate token.' });
  }
};

export { authenticateToken };
