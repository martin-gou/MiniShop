import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { getProduct } from "../api/client";
import { useCart } from "../store/cart";

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addItem } = useCart();
  const [product, setProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProduct(id)
      .then((data) => {
        if (!mounted) return;
        setProduct(data);
      })
      .catch((err) => {
        if (!mounted) return;
        setError(err.message || "加载失败");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [id]);

  const handleAdd = () => {
    if (!product) return;
    addItem(product, quantity);
    navigate("/cart");
  };

  if (loading) {
    return <p>加载中...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  if (!product) {
    return <p>商品不存在</p>;
  }

  const isOutOfStock = Number(product.stock) <= 0;

  return (
    <div className="detail">
      <div className="detail-info">
        <h2>{product.name}</h2>
        <p className="detail-price">¥ {product.price}</p>
        <p className="detail-desc">{product.description || "暂无描述"}</p>
        <p className="detail-stock">库存：{product.stock}</p>
      </div>
      <div className="detail-actions">
        <label>
          数量
          <input
            type="number"
            min="1"
            max={product.stock}
            value={quantity}
            onChange={(event) => setQuantity(Number(event.target.value))}
            disabled={isOutOfStock}
          />
        </label>
        <button className="btn primary" onClick={handleAdd} disabled={isOutOfStock}>
          {isOutOfStock ? "暂时缺货" : "加入购物车"}
        </button>
      </div>
    </div>
  );
}
