import React, { useEffect, useState } from "react";

import { getProducts } from "../api/client";
import ProductCard from "../components/ProductCard";

export default function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    getProducts()
      .then((data) => {
        if (!mounted) return;
        const list = data.results || data;
        setProducts(list);
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
  }, []);

  if (loading) {
    return <p>加载中...</p>;
  }

  if (error) {
    return <p className="error">{error}</p>;
  }

  return (
    <div>
      <h2 className="page-title">商品列表</h2>
      <div className="grid">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  );
}
