import logger from '#config/logger.js';
import { db } from '#config/database.js';
import { users } from '#models/user.model.js';
import { and, eq, ne } from 'drizzle-orm';

// Never select the password hash.
const publicUserFields = {
  id: users.id,
  email: users.email,
  name: users.name,
  role: users.role,
  created_at: users.created_at,
  updated_at: users.updated_at,
};

export const getAllUsers = async () => {
  try {
    return await db.select(publicUserFields).from(users);
  } catch (e) {
    logger.error('Error getting users', e);
    throw e;
  }
};

export const getUserById = async id => {
  try {
    const [user] = await db
      .select(publicUserFields)
      .from(users)
      .where(eq(users.id, id))
      .limit(1);

    if (!user) {
      throw new Error('User not found');
    }

    return user;
  } catch (e) {
    logger.error(`Error getting user by id ${id}`, e);
    throw e;
  }
};

export const updateUser = async (id, updates) => {
  try {
    // Throws 'User not found' if the user doesn't exist.
    await getUserById(id);

    if (updates.email) {
      const [emailTaken] = await db
        .select({ id: users.id })
        .from(users)
        .where(and(eq(users.email, updates.email), ne(users.id, id)))
        .limit(1);

      if (emailTaken) {
        throw new Error('Email already in use');
      }
    }

    const [updatedUser] = await db
      .update(users)
      .set({ ...updates, updated_at: new Date() })
      .where(eq(users.id, id))
      .returning(publicUserFields);

    logger.info(`User ${updatedUser.email} updated successfully`);
    return updatedUser;
  } catch (e) {
    logger.error(`Error updating user ${id}`, e);
    throw e;
  }
};

export const deleteUser = async id => {
  try {
    const [deletedUser] = await db
      .delete(users)
      .where(eq(users.id, id))
      .returning({ id: users.id, email: users.email });

    if (!deletedUser) {
      throw new Error('User not found');
    }

    logger.info(`User ${deletedUser.email} deleted successfully`);
    return deletedUser;
  } catch (e) {
    logger.error(`Error deleting user ${id}`, e);
    throw e;
  }
};
