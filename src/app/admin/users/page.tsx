"use client";

import { useEffect, useState, useCallback } from "react";
import { Shield, User } from "lucide-react";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  createdAt: string;
  _count: { orders: number };
}

export default function AdminUsers() {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchUsers = useCallback(() => {
    const token = localStorage.getItem("token");
    fetch("/api/users", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => r.json())
      .then((data) => {
        setUsers(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  return (
    <div>
      <div>
        <h1 className="text-3xl font-black">Users</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage registered users and roles
        </p>
      </div>

      <div className="mt-8 overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
        {loading ? (
          <div className="p-12 text-center">
            <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
          </div>
        ) : users.length === 0 ? (
          <div className="p-12 text-center">
            <p className="text-gray-400">No users found</p>
          </div>
        ) : (
          <table className="w-full text-left text-sm">
            <thead className="border-b border-gray-100 bg-gray-50">
              <tr>
                <th className="px-6 py-3 font-bold text-gray-500">User</th>
                <th className="px-6 py-3 font-bold text-gray-500 md:table-cell">
                  Email
                </th>
                <th className="px-6 py-3 font-bold text-gray-500 lg:table-cell">
                  Role
                </th>
                <th className="px-6 py-3 font-bold text-gray-500 lg:table-cell">
                  Orders
                </th>
                <th className="px-6 py-3 font-bold text-gray-500 xl:table-cell">
                  Joined
                </th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-gray-50 transition-colors hover:bg-gray-50/50"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`flex h-9 w-9 items-center justify-center rounded-full ${
                          u.role === "admin"
                            ? "bg-black text-white"
                            : "bg-gray-100 text-gray-500"
                        }`}
                      >
                        {u.role === "admin" ? (
                          <Shield className="h-4 w-4" />
                        ) : (
                          <User className="h-4 w-4" />
                        )}
                      </div>
                      <div>
                        <p className="font-bold">{u.name}</p>
                        {u.phone && (
                          <p className="text-xs text-gray-400">{u.phone}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="hidden px-6 py-4 text-gray-500 md:table-cell">
                    {u.email}
                  </td>
                  <td className="hidden px-6 py-4 lg:table-cell">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-bold ${
                        u.role === "admin"
                          ? "bg-purple-100 text-purple-700"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td className="hidden px-6 py-4 font-bold lg:table-cell">
                    {u._count.orders}
                  </td>
                  <td className="hidden px-6 py-4 text-xs text-gray-400 xl:table-cell">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
