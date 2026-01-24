import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import MyOrders from "./pages/MyOrders";
import AddEditOrder from "./pages/AddEditOrder";
import Products from "./pages/Products";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/my-orders" />} />
        <Route path="/my-orders" element={<MyOrders />} />
        <Route path="/add-order" element={<AddEditOrder />} />
        <Route path="/add-order/:id" element={<AddEditOrder />} />
        <Route path="/products" element={<Products />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
