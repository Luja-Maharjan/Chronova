import crypto from 'crypto';

export const ESEWA_CONFIG = {
  productCode: process.env.ESEWA_PRODUCT_CODE || 'EPAYTEST',
  secretKey: process.env.ESEWA_SECRET_KEY || '8gBm/:&EnhH.1/q',
  formUrl: process.env.ESEWA_FORM_URL || 'https://rc-epay.esewa.com.np/api/epay/main/v2/form',
  statusUrl: process.env.ESEWA_STATUS_URL || 'https://rc-epay.esewa.com.np/api/epay/transaction/status/',
  signedFieldNames: 'total_amount,transaction_uuid,product_code',
};

/** Format NPR amounts to exactly 2 decimal places (required for signature consistency). */
export function formatAmount(value) {
  return Number(value).toFixed(2);
}

export function buildSignedMessage(totalAmount, transactionUuid, productCode) {
  return `total_amount=${totalAmount},transaction_uuid=${transactionUuid},product_code=${productCode}`;
}

export function generateSignature(totalAmount, transactionUuid, productCode) {
  const message = buildSignedMessage(totalAmount, transactionUuid, productCode);
  const signature = crypto
    .createHmac('sha256', ESEWA_CONFIG.secretKey)
    .update(message)
    .digest('base64');

  console.log('[eSewa] Signature generation');
  console.log('[eSewa] Message:', message);
  console.log('[eSewa] Signature:', signature);

  return signature;
}

/**
 * Build ePay v2 form fields. total_amount is derived from component amounts
 * so it always satisfies: total_amount = amount + tax + service + delivery.
 */
export function buildPaymentFormFields({
  itemsPrice,
  taxPrice,
  shippingPrice,
  transactionUuid,
  successUrl,
  failureUrl,
}) {
  const amount = formatAmount(itemsPrice);
  const tax_amount = formatAmount(taxPrice);
  const product_service_charge = formatAmount(0);
  const product_delivery_charge = formatAmount(shippingPrice);

  const total_amount = formatAmount(
    parseFloat(amount) +
      parseFloat(tax_amount) +
      parseFloat(product_service_charge) +
      parseFloat(product_delivery_charge)
  );

  const signature = generateSignature(
    total_amount,
    transactionUuid,
    ESEWA_CONFIG.productCode
  );

  const fields = {
    amount,
    tax_amount,
    total_amount,
    transaction_uuid: transactionUuid,
    product_code: ESEWA_CONFIG.productCode,
    product_service_charge,
    product_delivery_charge,
    success_url: successUrl,
    failure_url: failureUrl,
    signed_field_names: ESEWA_CONFIG.signedFieldNames,
    signature,
  };

  console.log('[eSewa] Payment form payload:', JSON.stringify(fields, null, 2));

  return {
    url: ESEWA_CONFIG.formUrl,
    fields,
    totalAmount: total_amount,
    transactionUuid,
  };
}

export function createTransactionUuid(orderId) {
  return `${orderId}-${Date.now()}`;
}

export function extractOrderIdFromTransactionUuid(transactionUuid) {
  const lastHyphen = transactionUuid.lastIndexOf('-');
  if (lastHyphen === -1) return transactionUuid;
  return transactionUuid.substring(0, lastHyphen);
}

export function decodeCallbackData(dataParam) {
  const urlDecoded = decodeURIComponent(dataParam);
  const jsonString = Buffer.from(urlDecoded, 'base64').toString('utf-8');
  const decoded = JSON.parse(jsonString);

  console.log('[eSewa] Decoded callback response:', JSON.stringify(decoded, null, 2));
  return decoded;
}

export function verifyCallbackSignature(decodedJson) {
  const { total_amount, transaction_uuid, product_code, signature } = decodedJson;

  const expectedSignature = generateSignature(total_amount, transaction_uuid, product_code);

  console.log('[eSewa] Callback signature verification');
  console.log('[eSewa] Expected:', expectedSignature);
  console.log('[eSewa] Received:', signature);

  if (!signature || expectedSignature.length !== signature.length) {
    return false;
  }

  return crypto.timingSafeEqual(
    Buffer.from(expectedSignature),
    Buffer.from(signature)
  );
}

export async function checkTransactionStatus({ productCode, totalAmount, transactionUuid }) {
  const baseUrl = ESEWA_CONFIG.statusUrl.endsWith('/')
    ? ESEWA_CONFIG.statusUrl
    : `${ESEWA_CONFIG.statusUrl}/`;

  const params = new URLSearchParams({
    product_code: productCode,
    total_amount: totalAmount,
    transaction_uuid: transactionUuid,
  });

  const url = `${baseUrl}?${params.toString()}`;
  console.log('[eSewa] Status verification request URL:', url);

  const response = await fetch(url, {
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    console.error('[eSewa] Status API HTTP error:', response.status);
    throw new Error(`eSewa status API returned ${response.status}`);
  }

  const statusData = await response.json();
  console.log('[eSewa] Status verification response:', JSON.stringify(statusData, null, 2));

  return statusData;
}

export function buildPaymentDetailsForOrder(order, frontendUrl) {
  const baseUrl = frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173';
  const transactionUuid = createTransactionUuid(order._id.toString());

  const payment = buildPaymentFormFields({
    itemsPrice: order.itemsPrice,
    taxPrice: order.taxPrice,
    shippingPrice: order.shippingPrice,
    transactionUuid,
    successUrl: `${baseUrl}/payment-success`,
    failureUrl: `${baseUrl}/payment-failure`,
  });

  return {
    paymentDetails: {
      url: payment.url,
      fields: payment.fields,
    },
    transactionUuid,
    totalAmount: payment.totalAmount,
  };
}
