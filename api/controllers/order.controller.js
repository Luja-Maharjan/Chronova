import Order from '../models/Order.js';
import {
  buildPaymentDetailsForOrder,
  checkTransactionStatus,
  decodeCallbackData,
  extractOrderIdFromTransactionUuid,
  formatAmount,
  verifyCallbackSignature,
} from '../services/esewa.service.js';
import {
  fulfillPaidOrder,
  reduceStock,
  validateStock,
} from '../services/orderFulfillment.service.js';

// @desc    Create new order
// @route   POST /api/order
// @access  Private
export const addOrderItems = async (req, res) => {
  const {
    orderItems,
    shippingAddress,
    itemsPrice,
    taxPrice,
    shippingPrice,
    totalPrice,
    paymentMethod,
    frontendUrl,
  } = req.body;

  if (!orderItems || orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  }

  const isEsewa = paymentMethod === 'eSewa';

  try {
    // Validate stock availability before creating any order
    await validateStock(orderItems);

    const order = new Order({
      user: req.user._id,
      orderItems,
      shippingAddress,
      itemsPrice,
      taxPrice,
      shippingPrice,
      totalPrice,
      paymentMethod: paymentMethod || 'COD',
      isPaid: false,
      orderStatus: isEsewa ? 'Pending Payment' : 'Processing',
      stockReduced: false,
    });

    const createdOrder = await order.save();
    console.log('[Order] Created order:', createdOrder._id, 'Status:', createdOrder.orderStatus);

    const responseData = createdOrder.toObject();

    if (isEsewa) {
      const { paymentDetails, transactionUuid } = buildPaymentDetailsForOrder(
        createdOrder,
        frontendUrl
      );

      createdOrder.transactionUuid = transactionUuid;
      await createdOrder.save();

      responseData.transactionUuid = transactionUuid;
      responseData.paymentDetails = paymentDetails;

      console.log('[Order] eSewa payment initiated. Order pending payment:', createdOrder._id);
    } else {
      // COD: reduce stock immediately since order is confirmed for delivery
      await reduceStock(orderItems);
      createdOrder.stockReduced = true;
      await createdOrder.save();
      console.log('[Order] COD order created and stock reduced:', createdOrder._id);
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('[Order] Failed to create order:', error.message);
    res.status(error.message.includes('Insufficient stock') ? 400 : 500).json({
      message: error.message,
    });
  }
};

// @desc    Retry eSewa payment for a pending order
// @route   POST /api/order/:id/retry-esewa
// @access  Private
export const retryEsewaPayment = async (req, res) => {
  const { frontendUrl } = req.body;

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: 'Access denied' });
    }

    if (order.paymentMethod !== 'eSewa') {
      return res.status(400).json({ message: 'This order does not use eSewa payment' });
    }

    if (order.isPaid) {
      return res.status(400).json({ message: 'Order is already paid' });
    }

    await validateStock(order.orderItems);

    const { paymentDetails, transactionUuid } = buildPaymentDetailsForOrder(order, frontendUrl);

    order.transactionUuid = transactionUuid;
    order.orderStatus = 'Pending Payment';
    await order.save();

    console.log('[Order] eSewa payment retry initiated for order:', order._id);

    res.json({
      orderId: order._id,
      transactionUuid,
      paymentDetails,
    });
  } catch (error) {
    console.error('[Order] Failed to retry eSewa payment:', error.message);
    res.status(error.message.includes('Insufficient stock') ? 400 : 500).json({
      message: error.message,
    });
  }
};

// @desc    Get order by ID
// @route   GET /api/order/:id
// @access  Private
export const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'name email');

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    if (order.user._id.toString() !== req.user._id.toString() && !req.user.isAdmin) {
      return res.status(403).json({ message: 'Access denied' });
    }

    res.json(order);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/order/myorders
// @access  Private
export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id }).sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all orders (Admin only)
// @route   GET /api/order
// @access  Private/Admin
export const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id name email').sort({ createdAt: -1 });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get order statistics (Admin only)
// @route   GET /api/order/stats
// @access  Private/Admin
export const getOrderStats = async (req, res) => {
  try {
    const orders = await Order.find({});

    const paidOrders = orders.filter((o) => o.isPaid);
    const totalSales = paidOrders.reduce((acc, order) => acc + order.totalPrice, 0);
    const pendingPayment = orders.filter(
      (o) => o.paymentMethod === 'eSewa' && !o.isPaid && o.orderStatus === 'Pending Payment'
    ).length;

    res.json({
      totalOrders: orders.length,
      paidOrders: paidOrders.length,
      pendingPayment,
      totalSales,
      totalRevenue: totalSales,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update order status to delivered
// @route   PUT /api/order/:id/deliver
// @access  Private/Admin
export const updateOrderToDelivered = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.isDelivered = true;
    order.deliveredAt = Date.now();
    order.orderStatus = 'Delivered';

    if (order.paymentMethod === 'COD') {
      order.isPaid = true;
      order.paidAt = Date.now();
    }

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Verify eSewa payment callback and fulfill order
// @route   POST /api/order/verify-esewa
// @access  Private
export const verifyEsewaPayment = async (req, res) => {
  console.log('[eSewa] Verification request received');
  console.log('[eSewa] Request body keys:', Object.keys(req.body));

  const { data } = req.body;
  if (!data) {
    console.error('[eSewa] Missing data parameter');
    return res.status(400).json({ message: 'Missing payment data' });
  }

  try {
    const decodedJson = decodeCallbackData(data);
    const {
      transaction_code,
      status,
      total_amount,
      transaction_uuid,
      product_code,
    } = decodedJson;

    const orderId = extractOrderIdFromTransactionUuid(transaction_uuid);
    console.log('[eSewa] Extracted order ID:', orderId);

    const order = await Order.findById(orderId);
    if (!order) {
      console.error('[eSewa] Order not found:', orderId);
      return res.status(404).json({ message: 'Order not found' });
    }

    // Idempotent: already paid
    if (order.isPaid) {
      console.log('[eSewa] Order already paid, returning success:', orderId);
      return res.json({
        message: 'Payment already verified',
        order,
        cartCleared: true,
      });
    }

    // Verify callback signature
    try {
      if (!verifyCallbackSignature(decodedJson)) {
        console.error('[eSewa] Signature verification failed');
        return res.status(400).json({ message: 'Signature verification failed' });
      }
    } catch (sigError) {
      console.error('[eSewa] Signature comparison error:', sigError.message);
      return res.status(400).json({ message: 'Signature verification failed' });
    }
    console.log('[eSewa] Callback signature verified');

    // Verify amount matches order
    const expectedAmount = formatAmount(order.totalPrice);
    if (formatAmount(total_amount) !== expectedAmount) {
      console.error('[eSewa] Amount mismatch. Expected:', expectedAmount, 'Received:', total_amount);
      return res.status(400).json({ message: 'Payment amount mismatch' });
    }

    // Verify with eSewa status API
    const statusData = await checkTransactionStatus({
      productCode: product_code,
      totalAmount: total_amount,
      transactionUuid: transaction_uuid,
    });

    if (statusData.status !== 'COMPLETE') {
      console.error('[eSewa] Transaction not complete. Status:', statusData.status);
      return res.status(400).json({
        message: `Transaction status is ${statusData.status}. Payment not confirmed.`,
      });
    }
    console.log('[eSewa] Transaction status confirmed as COMPLETE');

    // Mark order as paid
    order.isPaid = true;
    order.paidAt = Date.now();
    order.orderStatus = 'Processing';
    order.transactionUuid = transaction_uuid;
    order.paymentResult = {
      id: transaction_code,
      status: statusData.status,
      update_time: new Date().toISOString(),
    };

    // Fulfill order: reduce stock and clear cart
    try {
      await fulfillPaidOrder(order);
    } catch (fulfillmentError) {
      console.error('[eSewa] Fulfillment failed after payment:', fulfillmentError.message);
      order.orderStatus = 'Processing';
      order.isPaid = true;
      await order.save();
      return res.status(400).json({
        message: `Payment received but fulfillment failed: ${fulfillmentError.message}. Contact support.`,
        order,
      });
    }

    const updatedOrder = await order.save();
    console.log('[eSewa] Order updated successfully:', updatedOrder._id);

    res.json({
      message: 'Payment verified successfully',
      order: updatedOrder,
      cartCleared: true,
    });
  } catch (error) {
    console.error('[eSewa] Verification exception:', error);
    res.status(500).json({ message: error.message || 'Payment verification failed' });
  }
};
