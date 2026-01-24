import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { getProducts } from "../api/products";
import {
  createOrder,
  addOrderItem,
  getOrderById,
  getOrderItems,
  updateOrderItem,
} from "../api/orders";

function AddEditOrder() {
  const { id } = useParams();
  const navigate = useNavigate();

  const isEdit = Boolean(id);

  // --------------------
  // Order state
  // --------------------
  const [orderNumber, setOrderNumber] = useState("");
  const [items, setItems] = useState([]);

  // --------------------
  // Products catalog (only for CREATE)
  // --------------------
  const [products, setProducts] = useState([]);

  // --------------------
  // Modal state (only for CREATE)
  // --------------------
  const [showModal, setShowModal] = useState(false);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [quantity, setQuantity] = useState(1);

  // --------------------
  // UI state
  // --------------------
  const [loading, setLoading] = useState(false);

  // --------------------
  // Derived values
  // --------------------
  const productsCount = items.length;
  const finalPrice = items.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );

  const currentDate = new Date().toISOString().split("T")[0];

  // --------------------
  // Load products (CREATE only)
  // --------------------
  useEffect(() => {
    if (isEdit) return;

    const loadProducts = async () => {
      try {
        const data = await getProducts();
        setProducts(data);
      } catch {
        alert("Error loading products");
      }
    };

    loadProducts();
  }, [isEdit]);

  // --------------------
  // Load order + items (EDIT only)
  // --------------------
  useEffect(() => {
    if (!isEdit) return;

    const loadOrder = async () => {
      try {
        const order = await getOrderById(id);
        setOrderNumber(order.orderNumber);

        const itemsData = await getOrderItems(id);
        setItems(itemsData);
      } catch {
        alert("Error loading order");
      }
    };

    loadOrder();
  }, [id, isEdit]);

  // --------------------
  // Add product (CREATE only, frontend)
  // --------------------
  const handleAddProduct = () => {
    if (!selectedProductId || quantity <= 0) {
      alert("Select product and quantity > 0");
      return;
    }

    const product = products.find(
      (p) => p.id === selectedProductId
    );

    const newItem = {
      id: crypto.randomUUID(), // frontend id
      productId: product.id,
      productName: product.name,
      unitPrice: product.unitPrice,
      quantity: Number(quantity),
    };

    setItems((prev) => [...prev, newItem]);

    setSelectedProductId("");
    setQuantity(1);
    setShowModal(false);
  };

  // --------------------
  // SAVE (CREATE vs EDIT)
  // --------------------
  const handleSaveOrder = async () => {
    if (!orderNumber) {
      alert("Order number is required");
      return;
    }

    setLoading(true);

    try {
      if (!isEdit) {
        // -------- CREATE --------
        if (items.length === 0) {
          alert("Add at least one product");
          return;
        }

        const order = await createOrder(orderNumber);

        for (const item of items) {
          await addOrderItem(
            order.id,
            item.productId,
            item.quantity
          );
        }
      } else {
        // -------- EDIT --------
        // ONLY update quantities
        for (const item of items) {
          await updateOrderItem(
            id,
            item.id,
            item.quantity
          );
        }
      }

      navigate("/my-orders");
    } catch {
      alert("Error saving changes");
    } finally {
      setLoading(false);
    }
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h1>{isEdit ? "Edit Order" : "Add Order"}</h1>
        <button
          className="btn btn-outline-secondary"
          onClick={() => navigate("/my-orders")}
        >
          Back
        </button>
      </div>

      {/* Order form */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Order #</label>
              <input
                className="form-control"
                value={orderNumber}
                onChange={(e) =>
                  setOrderNumber(e.target.value)
                }
                disabled={isEdit}
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Date</label>
              <input
                className="form-control"
                value={currentDate}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label"># Products</label>
              <input
                className="form-control"
                value={productsCount}
                disabled
              />
            </div>

            <div className="col-md-6">
              <label className="form-label">Final Price</label>
              <input
                className="form-control"
                value={`$${finalPrice}`}
                disabled
              />
            </div>
          </div>
        </div>
      </div>

      {/* Products header */}
      <div className="d-flex justify-content-between align-items-center mb-2">
        <h4>Products</h4>

        {!isEdit && (
          <button
            className="btn btn-success"
            onClick={() => setShowModal(true)}
          >
            Add product
          </button>
        )}
      </div>

      {/* Products table */}
      <table className="table table-bordered table-hover mb-4">
        <thead className="table-light">
          <tr>
            <th>Name</th>
            <th>Unit Price</th>
            <th>Qty</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.length === 0 ? (
            <tr>
              <td colSpan="4" className="text-center">
                No products added
              </td>
            </tr>
          ) : (
            items.map((item) => (
              <tr key={item.id}>
                <td>{item.productName}</td>
                <td>${item.unitPrice}</td>
                <td>
                  {isEdit ? (
                    <input
                      type="number"
                      min="1"
                      className="form-control form-control-sm"
                      value={item.quantity}
                      onChange={(e) => {
                        const newQty = Number(
                          e.target.value
                        );
                        setItems((prev) =>
                          prev.map((i) =>
                            i.id === item.id
                              ? {
                                  ...i,
                                  quantity: newQty,
                                }
                              : i
                          )
                        );
                      }}
                    />
                  ) : (
                    item.quantity
                  )}
                </td>
                <td>
                  ${item.unitPrice * item.quantity}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>

      {/* Save */}
      <div className="text-end">
        <button
          className="btn btn-primary"
          onClick={handleSaveOrder}
          disabled={loading}
        >
          {loading ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Modal (CREATE only) */}
      {showModal && !isEdit && (
        <div
          className="modal fade show"
          style={{
            display: "block",
            backgroundColor: "rgba(0,0,0,0.5)",
          }}
        >
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  Add Product
                </h5>
                <button
                  className="btn-close"
                  onClick={() => setShowModal(false)}
                />
              </div>

              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">
                    Product
                  </label>
                  <select
                    className="form-select"
                    value={selectedProductId}
                    onChange={(e) =>
                      setSelectedProductId(e.target.value)
                    }
                  >
                    <option value="">
                      Select product
                    </option>
                    {products.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name} (${p.unitPrice})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="form-label">
                    Quantity
                  </label>
                  <input
                    type="number"
                    className="form-control"
                    min="1"
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(e.target.value)
                    }
                  />
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </button>
                <button
                  className="btn btn-primary"
                  onClick={handleAddProduct}
                >
                  Add
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default AddEditOrder;
