import express from 'express';
import {
  fetchAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} from '#controllers/users.controller.js';
import { authenticateToken } from '#middleware/auth.middleware.js';

const router = express.Router();

// All user routes require a signed-in user (JWT cookie from /api/auth/sign-in).
router.use(authenticateToken);

router.get('/', fetchAllUsers);
router.get('/:id', getUserById);
router.put('/:id', updateUser);
router.delete('/:id', deleteUser);

export default router;
