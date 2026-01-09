import React, { useEffect } from "react";
import { Route, Routes } from "react-router-dom";

import { initCsrf } from "./api/client";
import Layout from "./components/Layout";
import Cart from "./pages/Cart";
import Home from "./pages/Home";
import OrderSuccess from "./pages/OrderSuccess";
import ProductDetail from "./pages/ProductDetail";

export default function App() {
  useEffect(() => {
    initCsrf().catch(() => {
      // ignore CSRF init errors in dev
    });
  }, []);

  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/order-success" element={<OrderSuccess />} />
      </Route>
    </Routes>
  );
}
