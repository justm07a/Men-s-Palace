"use client";

import { useEffect, useState } from "react";
import { Package, ShoppingCart, Users, TrendingUp } from "lucide-react";

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    products: 0,
    orders: 0,
    users: 0,
    revenue: 0,
  });
  const [recentOrders, setRecentOrders] = useState([]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const headers = { Authorization: `Bearer ${token}` };

    Promise.all([
      fetch("/api/products").then((r) => r.json()),
      fetch("/api/orders", { headers })
        .then((r) => r.json())
        .catch(() => []),
      fetch("/api/users", { headers })
        .then((r) => r.json())
        .catch(() => []),
    ]).then(([products, orders, users]) => {
      const revenue = Array.isArray(orders)
        ? orders.reduce(
            (sum: number, o: { totalPrice: number }) => sum + o.totalPrice,
            0
          )
        : 0;
      setStats({
        products: Array.isArray(products) ? products.length : 0,
        orders: Array.isArray(orders) ? orders.length : 0,
        users: Array.isArray(users) ? users.length : 0,
        revenue,
      });
      if (Array.isArray(orders)) setRecentOrders(orders.slice(0, 5) as never[]);
    });
  }, []);

  const statCards = [
    {
      label: "Products",
      value: stats.products,
      icon: Package,
      color: "bg-blue-50 text-blue-600",
    },
    {
      label: "Orders",
      value: stats.orders,
      icon: ShoppingCart,
      color: "bg-green-50 text-green-600",
    },
    {
      label: "Revenue",
      value: `EGP ${stats.revenue.toLocaleString()}`,
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
    },
    {
      label: "Users",
      value: stats.users,
      icon: Users,
      color: "bg-amber-50 text-amber-600",
    },
  ];

  return (
    <div>
      <h1 className="text-3xl font-black">Dashboard</h1>
      <p className="mt-1 text-sm text-gray-500">
        Overview of your store performance
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((card) => (
          <div
            key={card.label}
            className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm"
          >
            <div className={`inline-flex rounded-xl p-3 ${card.color}`}>
              <card.icon className="h-5 w-5" />
            </div>
            <p className="mt-4 text-2xl font-black">{card.value}</p>
            <p className="text-sm text-gray-500">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-bold">Recent Orders</h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-gray-400">No orders yet</p>
        ) : (
          <div className="mt-4 space-y-3">
            {(
              recentOrders as Array<{
                id: string;
                user?: { name: string };
                totalPrice: number;
                orderStatus: string;
              }>
            ).map((order) => (
              <div
                key={order.id}
                className="flex items-center justify-between rounded-xl border border-gray-100 p-4"
              >
                <div>
                  <p className="text-sm font-bold">
                    {order.user?.name || "Guest"}
                  </p>
                  <p className="text-xs text-gray-400">
                    EGP {order.totalPrice.toLocaleString()}
                  </p>
                </div>
                <span
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    order.orderStatus === "delivered"
                      ? "bg-green-100 text-green-700"
                      : order.orderStatus === "shipped"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-yellow-100 text-yellow-700"
                  }`}
                >
                  {order.orderStatus}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
