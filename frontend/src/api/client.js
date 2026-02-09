const API_BASE = import.meta.env.VITE_API_BASE_URL || "/api";

function getCookie(name) {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop().split(";").shift();
  }
  return null;
}

async function request(path, options = {}) {
  const config = { ...options };
  const method = (config.method || "GET").toUpperCase();
  const headers = { ...(config.headers || {}) };

  if (config.body && typeof config.body === "object" && !(config.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
    config.body = JSON.stringify(config.body);
  }

  if (!["GET", "HEAD", "OPTIONS"].includes(method)) {
    const csrfToken = getCookie("csrftoken");
    if (csrfToken) {
      headers["X-CSRFToken"] = csrfToken;
    }
  }

  const response = await fetch(`${API_BASE}${path}`, {
    credentials: "include",
    ...config,
    headers,
  });

  if (!response.ok) {
    let detail = "请求失败";
    try {
      const data = await response.json();
      detail = data.detail || JSON.stringify(data);
    } catch (error) {
      detail = response.statusText || detail;
    }
    throw new Error(detail);
  }

  if (response.status === 204) {
    return null;
  }

  return response.json();
}

export async function initCsrf() {
  return request("/auth/csrf/");
}

export async function getProducts(params = "") {
  return request(`/products/${params}`);
}

export async function getProduct(id) {
  return request(`/products/${id}/`);
}

export async function createOrder(payload) {
  return request("/orders/", {
    method: "POST",
    body: payload,
  });
}
