import React from "react";
import { Link, useSearchParams } from "react-router-dom";

export default function OrderSuccess() {
  const [params] = useSearchParams();
  const orderId = params.get("orderId");

  return (
    <div className="success">
      <h2>下单成功</h2>
      <p>订单号：{orderId || "-"}</p>
      <Link to="/" className="btn">
        返回首页
      </Link>
    </div>
  );
}
