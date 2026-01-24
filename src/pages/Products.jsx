import { useEffect, useState } from "react";

import {
  getProducts,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../api/products";

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form state
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("");
  const [unitPrice, setUnitPrice] = useState("");

  // --------------------
  // Load products
  // --------------------
  const loadProducts = async () => {
    try {
      const data = await getProducts();
      setProducts(data);
    } catch {
      alert("Error loading products");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // --------------------
  // Save (Create / Update)
  // --------------------
  const handleSave = async () => {
    if (!name || unitPrice <= 0) {
      alert("Name and unit price are required");
      return;
    }

    try {
      if (editingId) {
        await updateProduct(editingId, {
          name,
          unitPrice: Number(unitPrice),
        });
      } else {
        await createProduct({
          name,
          unitPrice: Number(unitPrice),
        });
      }

      resetForm();
      loadProducts();
    } catch {
      alert("Error saving product");
    }
  };

  // --------------------
  // Edit
  // --------------------
  const handleEdit = (product) => {
    setEditingId(product.id);
    setName(product.name);
    setUnitPrice(product.unitPrice);
  };

  // --------------------
  // Delete
  // --------------------
  const handleDelete = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this product?"
    );
    if (!confirmed) return;

    try {
      await deleteProduct(id);
      loadProducts();
    } catch {
      alert("Error deleting product");
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setName("");
    setUnitPrice("");
  };

  // --------------------
  // Render
  // --------------------
  return (
    <div className="container mt-4">
      <h1 className="mb-4">Products</h1>

      {/* Form */}
      <div className="card mb-4">
        <div className="card-body">
          <h5 className="mb-3">
            {editingId ? "Edit Product" : "Add Product"}
          </h5>

          <div className="row g-3">
            <div className="col-md-6">
              <label className="form-label">Name</label>
              <input
                className="form-control"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>

            <div className="col-md-4">
              <label className="form-label">Unit Price</label>
              <input
                type="number"
                min="0"
                className="form-control"
                value={unitPrice}
                onChange={(e) => setUnitPrice(e.target.value)}
              />
            </div>

            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-primary w-100"
                onClick={handleSave}
              >
                {editingId ? "Update" : "Add"}
              </button>
            </div>
          </div>

          {editingId && (
            <button
              className="btn btn-link mt-2"
              onClick={resetForm}
            >
              Cancel edit
            </button>
          )}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <p>Loading products...</p>
      ) : (
        <table className="table table-bordered table-hover">
          <thead className="table-light">
            <tr>
              <th>ID</th>
              <th>Name</th>
              <th>Unit Price</th>
              <th style={{ width: "160px" }}>Options</th>
            </tr>
          </thead>
          <tbody>
            {products.length === 0 ? (
              <tr>
                <td colSpan="4" className="text-center">
                  No products found
                </td>
              </tr>
            ) : (
              products.map((p) => (
                <tr key={p.id}>
                  <td>{p.id}</td>
                  <td>{p.name}</td>
                  <td>${p.unitPrice}</td>
                  <td>
                    <button
                      className="btn btn-sm btn-outline-secondary me-2"
                      onClick={() => handleEdit(p)}
                    >
                      Edit
                    </button>
                    <button
                      className="btn btn-sm btn-outline-danger"
                      onClick={() => handleDelete(p.id)}
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

export default Products;
