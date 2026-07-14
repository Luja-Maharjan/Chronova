import Cart from '../models/Cart.js';
import Product from '../models/Product.js';

/**
 * Validate that all order items have sufficient stock before fulfillment.
 */
export async function validateStock(orderItems) {
  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      throw new Error(`Product not found: ${item.name}`);
    }
    if (product.countInStock < item.qty) {
      throw new Error(`Insufficient stock for ${product.name}. Available: ${product.countInStock}`);
    }
  }
}

/**
 * Reduce product stock for order items. Called only after payment is confirmed.
 */
export async function reduceStock(orderItems) {
  console.log('[Fulfillment] Reducing stock for order items:', orderItems.length);

  for (const item of orderItems) {
    const product = await Product.findById(item.product);
    if (!product) {
      console.warn(`[Fulfillment] Product not found for stock reduction: ${item.product}`);
      continue;
    }

    const previousStock = product.countInStock;
    product.countInStock = Math.max(0, product.countInStock - item.qty);
    await product.save();

    console.log(
      `[Fulfillment] Stock updated: ${product.name} ${previousStock} -> ${product.countInStock}`
    );
  }
}

/**
 * Clear the user's shopping cart after successful payment.
 */
export async function clearUserCart(userId) {
  const cart = await Cart.findOne({ user: userId });
  if (cart) {
    cart.items = [];
    await cart.save();
    console.log('[Fulfillment] Cart cleared for user:', userId);
  }
}

/**
 * Fulfill a paid order: reduce stock and clear cart.
 * Idempotent — skips stock reduction if order.stockReduced is already true.
 */
export async function fulfillPaidOrder(order) {
  if (order.stockReduced) {
    console.log('[Fulfillment] Order already fulfilled, skipping stock reduction:', order._id);
    await clearUserCart(order.user);
    return order;
  }

  await validateStock(order.orderItems);
  await reduceStock(order.orderItems);
  await clearUserCart(order.user);

  order.stockReduced = true;
  console.log('[Fulfillment] Order fulfilled successfully:', order._id);
  return order;
}
