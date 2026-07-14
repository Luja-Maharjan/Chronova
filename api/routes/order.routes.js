import express from 'express';
import {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  getOrderStats,
  updateOrderToDelivered,
  verifyEsewaPayment,
  retryEsewaPayment,
} from '../controllers/order.controller.js';
import { protect, admin } from '../middleware/auth.middleware.js';

const router = express.Router();

router.route('/')
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route('/myorders').get(protect, getMyOrders);
router.route('/stats').get(protect, admin, getOrderStats);
// Public — eSewa redirects the browser here; auth may expire during payment
router.route('/verify-esewa').post(verifyEsewaPayment);
router.route('/:id/retry-esewa').post(protect, retryEsewaPayment);
router.route('/:id').get(protect, getOrderById);
router.route('/:id/deliver').put(protect, admin, updateOrderToDelivered);

export default router;
