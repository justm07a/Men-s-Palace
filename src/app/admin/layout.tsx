"use client";

import { useEffect, useState, useCallback, lazy, Suspense } from "react";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FolderOpen,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";

const tabs = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "products", label: "Products", icon: Package },
  { id: "orders", label: "Orders", icon: ShoppingCart },
  { id: "users", label: "Users", icon: Users },
  { id: "categories", label: "Categories", icon: FolderOpen },
  { id: "settings", label: "Settings", icon: Settings },
];

const tabComponents: Record<string, React.LazyExoticComponent<React.ComponentType>> = {
  dashboard: lazy(() => import("./page")),
  products: lazy(() => import("./products/page")),
  orders: lazy(() => import("./orders/page")),
  users: lazy(() => import("./users/page")),
  categories: lazy(() => import("./categories/page")),
  settings: lazy(() => import("./settings/page")),
};

function TabLoader() {
  return (
    <div className="flex items-center justify-center py-20">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
    </div>
  );
}

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [authorized, setAuthorized] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileDrawer, setMobileDrawer] = useState(false);

  const getTabFromPath = (path: string) => {
    if (path === "/admin") return "dashboard";
    const seg = path.replace("/admin/", "");
    return tabs.find((t) => t.id === seg)?.id || "dashboard";
  };

  const [activeTab, setActiveTab] = useState("dashboard");

  useEffect(() => {
    setActiveTab(getTabFromPath(pathname));
  }, [pathname]);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (!stored) { window.location.href = "/"; return; }
    try {
      const user = JSON.parse(stored);
      if (user.role !== "admin") { window.location.href = "/"; return; }
      setAuthorized(true);
    } catch { window.location.href = "/"; }
  }, []);

  useEffect(() => { setMobileDrawer(false); }, [activeTab]);
  useEffect(() => {
    document.body.style.overflow = mobileDrawer ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobileDrawer]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/";
  }, []);

  const switchTab = useCallback((tabId: string) => {
    setActiveTab(tabId);
    window.history.pushState(null, "", tabId === "dashboard" ? "/admin" : `/admin/${tabId}`);
  }, []);

  useEffect(() => {
    const onPop = () => {
      const seg = window.location.pathname.replace("/admin/", "");
      const tab = tabs.find((t) => t.id === seg)?.id || "dashboard";
      setActiveTab(tab);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  if (!authorized) return (
    <div className="flex h-screen items-center justify-center">
      <div className="h-8 w-8 animate-spin rounded-full border-2 border-black border-t-transparent" />
    </div>
  );

  const SidebarContent = ({ collapsed }: { collapsed?: boolean }) => (
    <>
      <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
        {!collapsed && <span className="text-lg font-black tracking-wider">MP ADMIN</span>}
        {!collapsed && (
          <button onClick={() => setSidebarOpen(!sidebarOpen)} className="hidden md:flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold transition hover:bg-gray-200">
            <ChevronLeft className="h-4 w-4" />
          </button>
        )}
        {collapsed && (
          <button onClick={() => setSidebarOpen(true)} className="hidden md:flex mx-auto h-8 w-8 items-center justify-center rounded-lg bg-gray-100 text-xs font-bold transition hover:bg-gray-200">
            <ChevronLeft className="h-4 w-4 rotate-180" />
          </button>
        )}
      </div>
      <nav className="flex-1 space-y-1 overflow-y-auto p-3">
        {tabs.map((item) => {
          const active = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { switchTab(item.id); setMobileDrawer(false); }}
              className={cn(
                "flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all",
                active ? "bg-black text-white shadow-sm" : "text-gray-500 hover:bg-gray-100 hover:text-gray-900",
                collapsed && "justify-center px-2"
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {!collapsed && <span>{item.label}</span>}
            </button>
          );
        })}
      </nav>
      <div className="border-t border-gray-100 p-3">
        <a href="/" className={cn("flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700", collapsed && "justify-center px-2")}>
          {!collapsed && <span>← Back to Store</span>}
        </a>
        <button onClick={handleLogout} className={cn("mt-1 flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-red-400 transition-colors hover:bg-red-50 hover:text-red-600", collapsed && "justify-center px-2")}>
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {!collapsed && <span>Logout</span>}
        </button>
      </div>
    </>
  );

  const ActiveComponent = tabComponents[activeTab];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* DESKTOP SIDEBAR */}
      <aside className={cn("hidden md:flex fixed inset-y-0 left-0 z-40 flex-col border-r border-gray-200 bg-white transition-all duration-300", sidebarOpen ? "w-64" : "w-[72px]")}>
        <SidebarContent collapsed={!sidebarOpen} />
      </aside>

      {/* MOBILE DRAWER OVERLAY */}
      {mobileDrawer && <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm md:hidden" onClick={() => setMobileDrawer(false)} />}

      {/* MOBILE SIDEBAR DRAWER */}
      <aside className={cn("fixed inset-y-0 left-0 z-50 flex w-64 flex-col border-r border-gray-200 bg-white shadow-2xl transition-transform duration-300 md:hidden", mobileDrawer ? "translate-x-0" : "-translate-x-full")}>
        <div className="flex h-16 items-center justify-between border-b border-gray-100 px-4">
          <span className="text-lg font-black tracking-wider">MP ADMIN</span>
          <button onClick={() => setMobileDrawer(false)} className="flex h-8 w-8 items-center justify-center rounded-lg bg-gray-100 transition hover:bg-gray-200"><X className="h-4 w-4" /></button>
        </div>
        <SidebarContent />
      </aside>

      {/* MAIN CONTENT */}
      <div className="flex w-full flex-1 flex-col md:ml-0">
        <div className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-gray-200 bg-white px-4 md:hidden">
          <button onClick={() => setMobileDrawer(true)} className="flex h-9 w-9 items-center justify-center rounded-lg bg-gray-100 transition hover:bg-gray-200"><Menu className="h-5 w-5" /></button>
          <span className="text-sm font-black tracking-wider">MP ADMIN</span>
        </div>
        <main className={cn("flex-1 transition-all duration-300", sidebarOpen ? "md:ml-64" : "md:ml-[72px]")}>
          <div className="w-full p-4 pb-24 sm:p-6 sm:pb-24 lg:p-8 lg:pb-8">
            <Suspense fallback={<TabLoader />}>
              {ActiveComponent && <ActiveComponent />}
            </Suspense>
          </div>
        </main>
      </div>

      {/* MOBILE PILL + LOGOUT */}
      <div className="fixed bottom-5 left-1/2 z-50 -translate-x-1/2 flex flex-row items-center justify-center gap-3 w-auto max-w-[95vw] md:hidden">
        <div className="flex-1 flex items-center justify-around bg-black/30 backdrop-blur-2xl border border-white/15 rounded-full px-4 py-2.5 shadow-2xl">
          {tabs.filter((t) => ["dashboard", "products", "orders", "users", "settings"].includes(t.id)).map((tab) => {
            const active = activeTab === tab.id;
            return (
              <button key={tab.id} onClick={() => switchTab(tab.id)} className="relative flex h-11 w-11 items-center justify-center rounded-full transition-colors active:scale-90">
                {active && <motion.div layoutId="activeAdminTab" className="absolute inset-0 rounded-full bg-white/20" transition={{ type: "spring", stiffness: 400, damping: 25, mass: 0.8 }} />}
                <div className="relative z-10">
                  <tab.icon className={cn("h-5 w-5 transition-colors", active ? "text-white" : "text-white/50")} />
                </div>
              </button>
            );
          })}
        </div>
        <button onClick={handleLogout} className="shrink-0 w-11 h-11 rounded-full flex items-center justify-center bg-black/30 backdrop-blur-2xl border border-white/15 shadow-xl active:scale-90 transition-transform">
          <LogOut className="h-5 w-5 text-white/90" />
        </button>
      </div>
    </div>
  );
}
