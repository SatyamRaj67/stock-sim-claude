"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
// import { Button } from "../ui/button";
import { 
  Home, 
  BarChart2, 
//   LineChart, 
  LayoutDashboard, 
  History, 
  ShieldAlert, 
  Briefcase 
} from "lucide-react";
import { useSession } from "next-auth/react";

export function Sidebar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  
  const isAdmin = session?.user?.isAdmin;
  
  const routes = [
    {
      href: "/",
      label: "Home",
      icon: <Home size={20} />,
      active: pathname === "/",
    },
    {
      href: "/market",
      label: "Market",
      icon: <BarChart2 size={20} />,
      active: pathname === "/market" || pathname.startsWith("/market/"),
    },
    {
      href: "/dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={20} />,
      active: pathname === "/dashboard",
    },
    {
      href: "/portfolio",
      label: "Portfolio",
      icon: <Briefcase size={20} />,
      active: pathname === "/portfolio",
    },
    {
      href: "/trades",
      label: "Trade History",
      icon: <History size={20} />,
      active: pathname === "/trades",
    },
  ];
  
  const adminRoutes = [
    {
      href: "/admin/dashboard",
      label: "Admin",
      icon: <ShieldAlert size={20} />,
      active: pathname.startsWith("/admin"),
    },
  ];

  return (
    <nav className="hidden border-r bg-background md:block md:w-64">
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <div className="space-y-1">
            {routes.map((route) => (
              <Link
                key={route.href}
                href={route.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                  route.active
                    ? "bg-muted text-primary"
                    : "text-muted-foreground"
                )}
              >
                {route.icon}
                {route.label}
              </Link>
            ))}
            
            {isAdmin && (
              <div className="mt-6 border-t pt-4">
                <h3 className="mb-2 px-3 text-sm font-semibold">Admin</h3>
                {adminRoutes.map((route) => (
                  <Link
                    key={route.href}
                    href={route.href}
                    className={cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:text-primary",
                      route.active
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )}
                  >
                    {route.icon}
                    {route.label}
                  </Link>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}