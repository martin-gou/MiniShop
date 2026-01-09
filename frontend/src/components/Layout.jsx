import React from "react";
import { NavLink, Outlet } from "react-router-dom";

import { useCart } from "../store/cart";

export default function Layout() {
  const { count } = useCart();

  return (
    <div className="app">
      <header className="app-header">
        <NavLink to="/" className="logo">
          MiniShop
        </NavLink>
        <nav className="nav-links">
          <NavLink to="/">商品</NavLink>
          <NavLink to="/cart">购物车 ({count})</NavLink>
        </nav>
      </header>
      <main className="app-main">
        <Outlet />
      </main>
    </div>
  );
}
