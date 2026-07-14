import express from 'express';
import {
  getCart,
  addToCart,
  updateCartQty,
  removeFromCart,
  clearCart,
} from '../controllers/cart.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // protect all cart routes

router.route('/')
  .get(getCart)
  .post(addToCart)
  .put(updateCartQty)
  .delete(clearCart);

router.route('/:productId')
  .delete(removeFromCart);

export default router;
