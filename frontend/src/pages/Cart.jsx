import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

import { createOrder } from "../api/client";
import { useCart } from "../store/cart";

export default function Cart() {
  const { items, updateQuantity, removeItem, total, clearCart } = useCart();
  const [shippingName, setShippingName] = useState("");
  const [shippingPhone, setShippingPhone] = useState("");
  const [shippingAddress, setShippingAddress] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!items.length) {
      setError("购物车为空。");
      return;
    }

    if (!shippingName || !shippingAddress) {
      setError("请填写收货人和地址。");
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        shipping_name: shippingName,
        shipping_phone: shippingPhone,
        shipping_address: shippingAddress,
        items: items.map((item) => ({
          product_id: item.product.id,
          quantity: item.quantity,
        })),
      };
      const order = await createOrder(payload);
      clearCart();
      navigate(`/order-success?orderId=${order.id}`);
    } catch (err) {
      setError(err.message || "下单失败");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="cart">
      <h2 className="page-title">购物车</h2>

      {!items.length ? (
        <p>购物车还是空的。</p>
      ) : (
        <div className="cart-grid">
          <div className="cart-list">
            {items.map((item) => (
              <div key={item.product.id} className="cart-item">
                <div>
                  <h4>{item.product.name}</h4>
                  <p>单价：¥ {item.product.price}</p>
                </div>
                <div className="cart-actions">
                  <input
                    type="number"
                    min="1"
                    max={item.product.stock}
                    value={item.quantity}
                    onChange={(event) =>
                      updateQuantity(item.product.id, Number(event.target.value))
                    }
                  />
                  <button className="btn ghost" onClick={() => removeItem(item.product.id)}>
                    删除
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="cart-summary">
            <h3>订单信息</h3>
            <p>合计：¥ {total.toFixed(2)}</p>

            <form onSubmit={handleSubmit} className="order-form">
              <label>
                收货人
                <input
                  type="text"
                  value={shippingName}
                  onChange={(event) => setShippingName(event.target.value)}
                />
              </label>
              <label>
                电话
                <input
                  type="text"
                  value={shippingPhone}
                  onChange={(event) => setShippingPhone(event.target.value)}
                />
              </label>
              <label>
                地址
                <textarea
                  value={shippingAddress}
                  onChange={(event) => setShippingAddress(event.target.value)}
                />
              </label>
              {error ? <p className="error">{error}</p> : null}
              <button className="btn primary" type="submit" disabled={submitting}>
                {submitting ? "提交中..." : "提交订单"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
