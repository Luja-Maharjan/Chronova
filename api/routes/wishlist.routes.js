import express from 'express';
import {
  getWishlist,
  addToWishlist,
  removeFromWishlist,
} from '../controllers/wishlist.controller.js';
import { protect } from '../middleware/auth.middleware.js';

const router = express.Router();

router.use(protect); // protect all wishlist routes

router.route('/')
  .get(getWishlist)
  .post(addToWishlist);

router.route('/:productId')
  .delete(removeFromWishlist);

export default router;
