"use client";

import { useEffect, useState, useCallback } from "react";
import { RefreshCw } from "lucide-react";

interface Order {
  id: string;
  totalPrice: number;
  orderStatus: string;
  paymentStatus: string;
  shippingAddress: string;
  createdAt: string;
  user?: { name: string; email: string };
  items: Array<{
    id: string;
    quantity: number;
    size: string;
    unitPrice: number;
    product: { title: string };
  }>;
}

const statuses = ["pending", "confirmed", "shipped", "delivered"];

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchOrders = useCallback(() => {
    setLoading(true);
    const token = localStorage.getItem("token");
    fetch("/api/orders", { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => { setOrders(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => { fetchOrders(); }, [fetchOrders]);

  const updateStatus = async (orderId: string, orderStatus: string) => {
    const token = localStorage.getItem("token");
    await fetch(`/api/orders/${orderId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
      body: JSON.stringify({ orderStatus }),
    });
    fetchOrders();
  };

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black">Orders</h1>
          <p className="mt-1 text-sm text-gray-500">Track and manage customer orders</p>
        </div>
        <button onClick={fetchOrders} className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-sm font-bold transition hover:bg-gray-50">
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </button>
      </div>

      {orders.length === 0 ? (
        <div className="mt-12 rounded-2xl bg-white p-12 text-center shadow-sm border border-gray-100">
          <p className="text-lg font-bold text-gray-400">No orders yet</p>
          <p className="mt-2 text-sm text-gray-400">Orders will appear here once customers start purchasing</p>
        </div>
      ) : (
        <div className="mt-8 space-y-4">
          {orders.map((order) => {
            const addressParts = order.shippingAddress.split("|");
            const address = addressParts[0]?.trim() || order.shippingAddress;
            const phone = addressParts.find((p) => p.toLowerCase().includes("phone"))?.split(":")[1]?.trim() || "";

            return (
              <div key={order.id} className="rounded-2xl bg-white p-6 shadow-sm border border-gray-100">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <div className="flex items-center gap-3">
                      <p className="font-bold">{order.user?.name || "Guest"}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold ${
                        order.orderStatus === "delivered" ? "bg-green-100 text-green-700" :
                        order.orderStatus === "shipped" ? "bg-purple-100 text-purple-700" :
                        order.orderStatus === "confirmed" ? "bg-blue-100 text-blue-700" :
                        "bg-yellow-100 text-yellow-700"
                      }`}>
                        {order.orderStatus.toUpperCase()}
                      </span>
                    </div>
                    <p className="mt-1 text-sm text-gray-500">{order.user?.email}</p>
                    {phone && (
                      <p className="mt-0.5 text-sm text-gray-500">Phone: {phone}</p>
                    )}
                    <p className="mt-1 text-xs text-gray-400">
                      {new Date(order.createdAt).toLocaleDateString("en-EG", {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                    <p className="mt-2 text-xs text-gray-400">Ship to: {address}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xl font-black">
                      <>EGP {order.totalPrice.toLocaleString()}</>
                    </p>
                    </p>
                    <div className="mt-2 flex gap-1.5">
                      {statuses.map((s) => (
                        <button
                          key={s}
                          onClick={() => updateStatus(order.id, s)}
                          className={`rounded-lg px-2.5 py-1 text-[10px] font-bold transition ${
                            order.orderStatus === s ? "bg-black text-white" : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                          }`}
                        >
                          {s}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
                <div className="mt-4 border-t border-gray-100 pt-4">
                  {order.items.map((item) => (
                    <div key={item.id} className="flex items-center justify-between py-1 text-sm">
                      <span className="text-gray-600">
                        {item.product.title} <span className="text-gray-400">×{item.quantity} ({item.size})</span>
                      </span>
                      <span className="font-bold">EGP {(item.unitPrice * item.quantity).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
