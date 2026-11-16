import logger from '#config/logger.js';
import * as usersService from '#services/users.services.js';
import {
  userIdSchema,
  updateUserSchema,
} from '#validations/users.validations.js';
import { formatValidationError } from '#utils/format.js';
import { cookies } from '#utils/cookies.js';

const validationFailed = (res, error) =>
  res.status(400).json({
    error: 'Validation failed',
    details: formatValidationError(error),
  });

export const fetchAllUsers = async (req, res, next) => {
  try {
    logger.info('Getting users ... ');

    const allUsers = await usersService.getAllUsers();

    res.json({
      message: 'Successfully retrieved users',
      users: allUsers,
      count: allUsers.length,
    });
  } catch (e) {
    logger.error(e);
    next(e);
  }
};

export const getUserById = async (req, res, next) => {
  try {
    const params = userIdSchema.safeParse(req.params);
    if (!params.success) return validationFailed(res, params.error);

    const { id } = params.data;
    logger.info(`Getting user by id: ${id}`);

    const user = await usersService.getUserById(id);

    res.json({ message: 'Successfully retrieved user', user });
  } catch (e) {
    logger.error(`Error fetching user by id: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};

export const updateUser = async (req, res, next) => {
  try {
    const params = userIdSchema.safeParse(req.params);
    if (!params.success) return validationFailed(res, params.error);

    const body = updateUserSchema.safeParse(req.body);
    if (!body.success) return validationFailed(res, body.error);

    const { id } = params.data;
    const updates = body.data;

    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === id;

    // Users may only update their own profile; admins may update anyone.
    if (!isAdmin && !isSelf) {
      logger.warn(`User ${req.user.email} tried to update user ${id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only update your own information',
      });
    }

    // Only admins may change roles (including their own).
    if (updates.role !== undefined && !isAdmin) {
      logger.warn(`User ${req.user.email} tried to change role of user ${id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'Only admins can change user roles',
      });
    }

    logger.info(`Updating user ${id} by ${req.user.email}`);
    const user = await usersService.updateUser(id, updates);

    res.json({ message: 'User updated successfully', user });
  } catch (e) {
    logger.error(`Error updating user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }
    if (e.message === 'Email already in use') {
      return res.status(409).json({ error: 'Email already in use' });
    }

    next(e);
  }
};

export const deleteUser = async (req, res, next) => {
  try {
    const params = userIdSchema.safeParse(req.params);
    if (!params.success) return validationFailed(res, params.error);

    const { id } = params.data;

    if (!req.user) {
      return res
        .status(401)
        .json({ error: 'Unauthorized', message: 'Authentication required' });
    }

    const isAdmin = req.user.role === 'admin';
    const isSelf = req.user.id === id;

    // Users may delete their own account; admins may delete anyone.
    if (!isAdmin && !isSelf) {
      logger.warn(`User ${req.user.email} tried to delete user ${id}`);
      return res.status(403).json({
        error: 'Forbidden',
        message: 'You can only delete your own account',
      });
    }

    logger.info(`Deleting user ${id} by ${req.user.email}`);
    await usersService.deleteUser(id);

    // A deleted user's session token is now meaningless — clear it.
    if (isSelf) cookies.clear(res, 'token');

    res.json({ message: 'User deleted successfully', id });
  } catch (e) {
    logger.error(`Error deleting user: ${e.message}`);

    if (e.message === 'User not found') {
      return res.status(404).json({ error: 'User not found' });
    }

    next(e);
  }
};
