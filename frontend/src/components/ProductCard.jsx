import React from "react";
import { Link } from "react-router-dom";

export default function ProductCard({ product }) {
  return (
    <div className="card">
      <div className="card-body">
        <h3>{product.name}</h3>
        <p className="card-meta">¥ {product.price}</p>
        <p className="card-desc">{product.description || "暂无描述"}</p>
      </div>
      <div className="card-actions">
        <Link to={`/product/${product.id}`} className="btn">
          查看详情
        </Link>
      </div>
    </div>
  );
}
