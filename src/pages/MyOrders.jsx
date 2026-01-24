import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  getOrders,
  getOrderItems,
  deleteOrder,
  updateOrderStatus,
} from "../api/orders";

// --------------------
// Order status mapping (enum)
// --------------------
const ORDER_STATUS = {
  1: "Pending",
  2: "In Progress",
  3: "Completed",
};

const ORDER_STATUS_OPTIONS = [
  { value: 1, label: "Pending" },
  { value: 2, label: "In Progress" },
  { value: 3, label: "Completed" },
];

function MyOrders() {
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  // --------------------
  // Load orders + items
  // --------------------
  useEffect(() => {
    const loadOrders = async () => {
      try {
        const ordersData = await getOrders();

        const ordersWithTotals = await Promise.all(
          ordersData.map(async (order) => {
            const items = await getOrderItems(order.id);

            const productsCount = items.reduce(
              (sum, item) => sum + item.quantity,
              0
            );

            const finalPrice = items.reduce(
              (sum, item) =>
                sum + item.unitPrice * item.quantity,
              0
            );

            return {
              ...order,
              productsCount,
              finalPrice,
            };
          })
        );

        setOrders(ordersWithTotals);
      } catch {
        alert("Error loading orders");
      } finally {
        setLoading(false);
      }
    };

    loadOrders();
  }, []);

  // --------------------
  // Delete order
  // --------------------
  const handleDelete = async (orderId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this order?"
    );
    if (!confirmed) return;

    try {
      await deleteOrder(orderId);
      setOrders((prev) =>
        prev.filter((o) => o.id !== orderId)
      );
    } catch {
      alert("Error deleting order");
    }
  };

  // --------------------
  // Change status
  // --------------------
  const handleStatusChange = async (orderId, newStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);

      setOrders((prev) =>
        prev.map((o) =>
          o.id === orderId
            ? { ...o, status: newStatus }
            : o
        )
      );
    } catch {
      alert("Error updating order status");
    }
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>My Orders</h1>
        <button
          className="btn btn-primary"
          onClick={() => navigate("/add-order")}
        >
          Add new order
        </button>
      </div>

      {loading ? (
        <p>Loading orders...</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Order #</th>
              <th>Date</th>
              <th># Products</th>
              <th>Final Price</th>
              <th>Status</th>
              <th style={{ width: "180px" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {orders.length === 0 ? (
              <tr>
                <td colSpan="7" className="text-center">
                  No orders found
                </td>
              </tr>
            ) : (
              orders.map((order) => (
                <tr key={order.id}>
                  <td>{order.id}</td>
                  <td>{order.orderNumber}</td>
                  <td>
                    {new Date(order.date).toLocaleDateString()}
                  </td>
                  <td>{order.productsCount}</td>
                  <td>${order.finalPrice}</td>

                  {/* Status */}
                  <td>
                    <select
                      className="form-select form-select-sm"
                      value={order.status}
                      disabled={order.status === 3}
                      onChange={(e) =>
                        handleStatusChange(
                          order.id,
                          Number(e.target.value)
                        )
                      }
                    >
                      {ORDER_STATUS_OPTIONS.map((opt) => (
                        <option
                          key={opt.value}
                          value={opt.value}
                        >
                          {opt.label}
                        </option>
                      ))}
                    </select>

                    <span
                      className={`badge ms-2 ${
                        order.status === 1
                          ? "bg-secondary"
                          : order.status === 2
                          ? "bg-info"
                          : "bg-success"
                      }`}
                    >
                      {ORDER_STATUS[order.status]}
                    </span>
                  </td>

                  {/* Options */}
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() =>
                        navigate(`/add-order/${order.id}`)
                      }
                      disabled={order.status === 3}
                    >
                      Edit
                    </button>

                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() =>
                        handleDelete(order.id)
                      }
                      disabled={order.status === 3}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}
    </div>
  );
}

export default MyOrders;
