import api from "./axios";

// ====================
// ORDERS
// ====================
export const getOrders = async () => {
  const response = await api.get("/orders");
  return response.data;
};

export const getOrderById = async (orderId) => {
  const response = await api.get(`/orders/${orderId}`);
  return response.data;
};

export const createOrder = async (orderNumber) => {
  const response = await api.post("/orders", {
    orderNumber,
  });
  return response.data;
};

export const deleteOrder = async (orderId) => {
  await api.delete(`/orders/${orderId}`);
};

// ====================
// ORDER STATUS
// ====================
export const updateOrderStatus = async (orderId, status) => {
  const response = await api.patch(
    `/orders/${orderId}/status`,
    { status } // enum number (1–3)
  );
  return response.data;
};

// ====================
// ORDER ITEMS
// ====================
export const getOrderItems = async (orderId) => {
  const response = await api.get(`/orders/${orderId}/items`);
  return response.data;
};

export const addOrderItem = async (
  orderId,
  productId,
  quantity
) => {
  const response = await api.post(
    `/orders/${orderId}/items`,
    { productId, quantity }
  );
  return response.data;
};

export const updateOrderItem = async (
  orderId,
  itemId,
  quantity
) => {
  const response = await api.put(
    `/orders/${orderId}/items/${itemId}`,
    { quantity }
  );
  return response.data;
};

export const deleteOrderItem = async (
  orderId,
  itemId
) => {
  await api.delete(
    `/orders/${orderId}/items/${itemId}`
  );
};
