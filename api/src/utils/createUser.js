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
    const session = await User.startSession();
    session.startTransaction();

    try {
      // Step 1: Create user (in transaction)
      const newUser = await User.create([{ username, password, referralId }], {
        session,
      });

      // Step 2: Generate token
      const token = generateToken(
        username,
        newUser[0]._id.toString(),
        password
      );

      // Step 3: Update with token (in transaction)
      newUser[0].token = token;
      await newUser[0].save({ session });

      await session.commitTransaction();
      return newUser[0];
    } catch (error) {
      await session.abortTransaction();
      throw new Error('User creation failed: Transaction rolled back');
    } finally {
      session.endSession();
    }
  } catch (err) {
    console.error('Error creating user:', err);
    throw new Error('User creation failed');
  }
};

export default createUser;
