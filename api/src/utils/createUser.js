// my-api/src/utils/createUser.js
import { generateToken } from './token-sys.js'; // Import the functions
import User from './schemas/mongoUserSchema.js'; // Import the User model

/**
 * Creates a new user and saves it to MongoDB with a generated token.
 *
 * @param {string} username - The username of the user.
 * @param {string} password - The password of the user.
 * @param {string|null} referralId - The ObjectId of the referring user (optional).
 * @returns {Promise<User>} - The created user object.
 * @throws {Error} - Throws an error if the user creation fails.
 */
const createUser = async (username, password, referralId) => {
  try {
    // Step 1: Create and save the user without the token
    const newUser = await User.create({ username, password, referralId });

    // Step 2: Generate the token
    const token = generateToken(username, newUser._id.toString(), password);

    // Step 3: Update the user document with the token
    newUser.token = token;
    await newUser.save();

    return newUser;
  } catch (err) {
    console.error('Error creating user:', err);
    throw new Error('User creation failed');
  }
};

export default createUser;
